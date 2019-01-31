const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Beer = require('../models/beer');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');


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
	// username is required to be unique on the model page, so a username cannot be replicated
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
	// console.log(req.body);
	// console.log(req.file);
	if (req.file) {
		const imageFilePath = './uploads/' + req.file.filename;
		userPassEntry.image.data = fs.readFileSync(imageFilePath);
		userPassEntry.image.contentType = req.file.mimetype;
		fs.unlinkSync(imageFilePath);
	}
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
		const foundUser = await User.find({});
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
		const foundUser = await User.findById(req.params.id);
		const currentUser = await User.findOne({username: req.session.username});
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
		let isCurrent = false;
		if (currentUser === null) {
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
		const foundUser = await User.findById(req.params.id);
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
		// console.log(foundBeer);
		// push to user fridge
		foundUser.fridge.push(foundBeer);
		// save result in db
		foundUser.save();
		// console.log(foundUser);
		// console.log(foundUser.fridge);
		// redirect to user profile
		res.redirect(`./${foundUser._id}`)
		// res.render('users/show.ejs', {
		// 	user: foundUser
	} catch (err) {
		res.send(err)
	}
});

// update
router.put('/:id/edited', upload.single('imageFile'), async (req, res) => {
	req.session.editMessage = '';
	try {
		const foundUser = await User.findById(req.params.id);
		// console.log(foundUser.image);
		// console.log(foundUser);
		// If there is a new picture uploaded:
		if (req.file) {
			const imageFilePath = './uploads/' + req.file.filename;
			const newPicture = {};
			newPicture.image = {};
			newPicture.image.data = fs.readFileSync(imageFilePath);
			newPicture.image.contentType = req.file.mimetype;
			fs.unlinkSync(imageFilePath);
			// console.log(newPicture);
			foundUser.image = newPicture.image;
			await foundUser.save();
			// console.log(foundUser.picture);
		}
		if(req.body.password.toString() === foundUser.password) {
			const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
		} else {
			const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
			const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
			updatedUser.password = hashedUserPassword;
			await updatedUser.save();
			// console.log("---------------");
			// console.log(updatedUser);
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
		res.redirect('/users');
	} catch (err) {
		req.session.editMessage = `Username and email are required`;
		res.redirect(`/users/${req.params.id}/edit`)
		// res.send(err)
	}
});

// delete
router.delete('/:id', async (req, res) => {
	try {
		const userDelete = await User.findByIdAndRemove(req.params.id);
		res.redirect('/');
	} catch (err) {
		res.send(err)
	}
});


// remove beer from fridge

router.delete('/:id/fridge', async (req, res) => {
	try {
		// find the User we are working on
		const foundUser = await User.findById(req.params.id);
		// filter all the beers that aren't being drank
		const removalIndex = foundUser.fridge.findIndex((beer) => {
			return beer._id.toString() === req.body.beerId.toString();
		})
		// console.log(removalIndex);
		foundUser.fridge.splice(removalIndex, 1);
		// const stillInFridge = foundUser.fridge.filter(beer => beer._id != req.body.beerId);
		// console.log(stillInFridge);
		// Make the fridge only contain the non-drank beers
		// foundUser.fridge = stillInFridge;
		// console.log(foundUser.fridge);
		// Save it
		await foundUser.save();
		// Stay on their page
		res.redirect(`/users/${req.params.id}`)
	} catch (err) {
		res.send(err)
	}
})



module.exports = router;