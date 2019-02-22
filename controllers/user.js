const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Beer = require('../models/beer');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const beerSeed = require('./seedBeerData');
const brewerySeed = require('./seedBreweryData');

// log in page
router.get('/login', async (req, res) => {
	res.render('users/login.ejs', {
		message: req.session.loginMessage,
		session: req.session
	})
});

// register page
router.get('/new', async (req, res) => {
	res.render('users/new.ejs', {
		session: req.session
	})
});

//SEED DATA
router.get('/user/seed/seed/thisisseed/data/insert', async (req, res) => {
	if(req.session.username === 'administrator'){
		Brewery.collection.insertMany(brewerySeed, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				console.log(response)
			}
		});
		Beer.collection.insertMany(beerSeed, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				console.log(response)
			}
		});
	}
	res.redirect(`/`);
})

// log in route
router.post('/login', async (req, res) => {
	req.session.loginMessage = '';
	try {
		const existingUser = await User.findOne({ username: req.body.username });
		// if user already exists
		if (!existingUser) {
			// print message on redirect page
			req.session.loginMessage = "Incorrect login, please try again.";
			console.log('failed login attempt, username did not exist');
			res.redirect('/users/login');
		} else {
			// password comparison
			// --> if correct password
			if (bcrypt.compareSync(req.body.password, existingUser.password)) {
				req.session.username = existingUser.username;
				req.session._id = existingUser._id;
				req.session.loggedIn = true;
				req.session.loginMessage = `We've been awaiting your prompt return, ${existingUser.username}`;
				res.redirect(`/users/${existingUser._id}`);
			// --> if incorrect password
			} else {
				req.session.loginMessage = "Incorrect login, please try again.";
				console.log('failed login attempt, incorrect password');
				res.redirect('/users/login');
			}
		}
	} catch (err) {
		res.send(err)
	}
});

// register route
router.post('/', upload.single('imageFile'), async (req, res) => {
	// username is required to be unique on the model page, so a username cannot be replicated, no logic necessary
	req.session.userMessage = '';
	// hash user password
	const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	const userPassEntry = {};
	// enter user input into database
	userPassEntry.password = hashedUserPassword;
	userPassEntry.username = req.body.username;
	userPassEntry.email = req.body.email;
	userPassEntry.city = req.body.city;
	userPassEntry.state = req.body.state;
	userPassEntry.image = {};
	// for image uploads
	if (req.file) {
		const imageFilePath = './uploads/' + req.file.filename;
		userPassEntry.image.data = fs.readFileSync(imageFilePath);
		userPassEntry.image.contentType = req.file.mimetype;
		fs.unlinkSync(imageFilePath);
	}
	// after information has been entered
	try {
		// create user
		const newUser = await User.create(userPassEntry);
		// log user in upon account creation
		req.session.loggedIn = true;
		req.session._id = newUser._id;
		req.session.username = newUser.username // username
		req.session.userMessage = `It's a pleasure to meet you, ${newUser.username}`;
		// console.log(newUser);
		res.redirect('/');
	} catch (err) {
		req.session.userMessage = `Username and email are required`;
		res.redirect('/users/new')
		// res.send(err)
	}
});

// log out
router.get('/logout', async (req, res) => {
	// end session, log user out
	req.session.destroy((err) => {
		res.redirect('/users/login')
	})
});

// index
router.get('/', async (req, res) => {
	try {
		// find all users
		const foundUser = await User.find({});
		// sort users alphabetically
		foundUser.sort((a, b) => {
			let nameA = a.username.toUpperCase(); // ignore upper and lowercase
			let nameB = b.username.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		res.render('users/index.ejs', {
			users: foundUser,
			session: req.session
		})
	} catch (err) {
		res.send(err)
	}
});

// show
router.get('/:id', async (req, res) => {
	try {
		// find shown user
		const foundUser = await User.findById(req.params.id);
		// find logged in user
		const currentUser = await User.findOne({username: req.session.username});
		// sort foundUser's fridge alphabetically
		foundUser.fridge.sort((a, b) => {
			let nameA = a.name.toUpperCase(); // ignore upper and lowercase
			let nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		// checking if currentUser is on their own profile or someone else's
		let isCurrent = false;
		if (currentUser === null) {
			// if not logged in
			isCurrent = false;
		} else if (foundUser._id.toString() !== currentUser._id.toString()) {
			isCurrent = false;
		} else {
			isCurrent = true;
		}
		res.render('users/show.ejs', {
			user: foundUser,
			currentUser: currentUser,
			isCurrent: isCurrent,
			session: req.session
		})
	} catch (err) {
		res.send(err)
	}
});

// edit
router.get('/:id/edit', async (req, res) => {
	try {
		// find user to edit
		const foundUser = await User.findById(req.params.id);
		/*
		if the logged in user is the same as the user being edited, render the edit page
		otherwise, redirect to home
		because the edit button will not appear on the show page unless the user 
		is logged in and looking at their own profile, this should not be a major concern
		but if someone typed in the actual route in the URL, this stops them from
		editing or deleting someone else's account
		*/
		if (req.session.username === foundUser.username) {
			res.render('users/edit.ejs', {
				user: foundUser,
				session: req.session
			})
		} else {
			res.redirect('/');
		}
	} catch (err) {
		res.send(err)
	}
})

// multer profile pictures
router.get('/:id/image', async (req, res) => {
	const foundUser = await User.findById(req.params.id);
	const image = foundUser.image;
	res.set('Content-Type', image.contentType);
	res.send(image.data);
})


// add beer to fridge from beer show page
router.put('/:id', async (req, res) => {
	try {
		// find beer by beerid as designated on beer show page
		const foundBeer = await Beer.findById(req.body.beerid);
		// find user that pressed the button on the show page
		const foundUser = await User.findOne({username: req.session.username});
		// push to user fridge
		foundUser.fridge.push(foundBeer);
		// save result in db
		foundUser.save();
		// redirect to user profile
		res.redirect(`./${foundUser._id}`)
	} catch (err) {
		res.send(err)
	}
});

// update
router.put('/:id/edited', upload.single('imageFile'), async (req, res) => {
	req.session.editMessage = '';
	try {
		// find user to update
		const foundUser = await User.findById(req.params.id);
		// if there is a new picture uploaded:
		if (req.file) {
			const imageFilePath = './uploads/' + req.file.filename;
			const newPicture = {};
			newPicture.image = {};
			newPicture.image.data = fs.readFileSync(imageFilePath);
			newPicture.image.contentType = req.file.mimetype;
			fs.unlinkSync(imageFilePath);
			foundUser.image = newPicture.image;
			await foundUser.save();
		}
		// if the user wants to change their password
		if(req.body.password.toString() === foundUser.password) {
			const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
		} else {
			const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
			const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
			updatedUser.password = hashedUserPassword;
			await updatedUser.save();
		}
// THIS WAS US MAKING THINGS TOO COMPLICATED
		// const foundUser = await User.findById(req.params.id);
		
		// const foundUsersFridge = foundUser.fridge;
		// foundUser.fridge = [];
		// console.log(foundUser.fridge);
		// console.log("----------------");
		// console.log(foundUsersFridge);
		// await foundUser.save();
		// const updateUser = await User.updateOne(foundUser, 
		// 	{
		// 		username: req.body.username,
		// 		// password: req.body.password,
		// 		email: req.body.email,
		// 		city: req.body.city,
		// 		state: req.body.state,
		// 		// fridge: foundUser.fridge
		// 	}, {new: true});
		// updateUser.fridge.push(foundUsersFridge);
		// await updateUser.save();
		// console.log(updateUser);
		res.redirect(`/users/${req.params.id}`);
	} catch (err) {
		req.session.editMessage = `Username and email are required`;
		res.redirect(`/users/${req.params.id}/edit`);
	}
});

// delete
router.delete('/:id', async (req, res) => {
	try {
		// delete button only appears from edit route
		const userDelete = await User.findByIdAndRemove(req.params.id);
		res.redirect('/users/logout');
	} catch (err) {
		res.send(err)
	}
});

// remove beer from fridge
router.delete('/:id/fridge', async (req, res) => {
	try {
		// find the user we are working on
		const foundUser = await User.findById(req.params.id);
		// filter all the beers that aren't being drank
		const removalIndex = foundUser.fridge.findIndex((beer) => {
			return beer._id.toString() === req.body.beerId.toString();
		});
		// remove only the beer index being drank
		foundUser.fridge.splice(removalIndex, 1);
		await foundUser.save();
		// Stay on their page
		res.redirect(`/users/${req.params.id}`)
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;