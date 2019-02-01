const express = require('express');
const router = express.Router();
const Beer = require('../models/beer');
const Brewery = require('../models/brewery');
const User = require('../models/user');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

// index --> get
router.get('/', async (req, res) => {
	try {
		// find current user
		const currentUser = await User.findOne({username: req.session.username});
		// find all beers
		const allBeers = await Beer.find({});
		// sort alphabetically
		allBeers.sort((a, b) => {
			let nameA = a.name.toUpperCase(); // ignore upper and lowercase
			let nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		res.render('beers/index.ejs', {
			beers: allBeers,
			currentUser: currentUser,
			session: req.session
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		// find breweries for dropdown
		const addBrewery = await Brewery.find({});
		// sort alphabetically
		addBrewery.sort((a, b) => {
			let nameA = a.name.toUpperCase(); // ignore upper and lowercase
			let nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		// find user to set creator
		const foundUser = await User.findOne({ username: req.session.username });
		res.render('beers/new.ejs', {
			breweries: addBrewery,
			user: foundUser,
			session: req.session
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', upload.single('imageFile'), async (req, res) => {
	req.session.beerMessage = '';
	// enter information into database
	// upvotes will be added independently
	const beerEntry = {};
	beerEntry.name = req.body.name;
	beerEntry.type = req.body.type;
	beerEntry.price = req.body.price;
	beerEntry.flavor = req.body.flavor;
	beerEntry.color = req.body.color;
	beerEntry.rating = [];
	beerEntry.maker = req.body.maker;
	beerEntry.user = req.body.user;
	beerEntry.image = {};
	// if there is an image upload
	if (req.file) {
		const imageFilePath = './uploads/' + req.file.filename;
		beerEntry.image.data = fs.readFileSync(imageFilePath);
		beerEntry.image.contentType = req.file.mimetype;
		fs.unlinkSync(imageFilePath);
	}
	try {
		// find brewery that was inputted
		const foundBrewery = await Brewery.findOne({name: req.body.maker});
		// create the new beer
		const newBeer = await Beer.create(beerEntry);
		// push the new beer into the brewery it belongs in
		foundBrewery.beers.push(newBeer);
		await foundBrewery.save();
		res.redirect('/beers');
	} catch (err) {
		req.session.beerMessage = `Need a name and brewery`;
		res.redirect('/beers/new');
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		// find beer to show
		const foundBeer = await Beer.findById(req.params.id);
		// find the brewery the beer belongs to
		const beerBrewery = await Brewery.findOne({'beers._id': req.params.id});
		// finding the user in order to determine if the user is logged in
		const currentUser = await User.findOne({username: req.session.username});
		const foundUser = await User.findOne({username: foundBeer.user});
		// find all users with this beer in their fridge
		const usersWithBeer = await User.find({'fridge._id': req.params.id});
		// upvoting mechanics
		let alreadyVoted = false;
		// if the logged in user's id is in the array of people that upvoted a beer
		// they cannot upvote it again
		if (currentUser) {
			for (let i = 0; i < foundBeer.plusOnes.length; i++) {
				if (foundBeer.plusOnes[i].toString() === currentUser._id.toString()) {
					alreadyVoted = true;
				}
			}
		} else {
			// if you are not logged in, you cannot upvote
			alreadyVoted = true
		};
		// determining if current user should be able to edit the beer
		let isCurrent = false;
		if (currentUser === null) {
			isCurrent = false;
		} else if (foundUser._id.toString() !== currentUser._id.toString()) {
			isCurrent = false;
		} else {
			isCurrent = true;
		}
		res.render('beers/show.ejs', {
			beer: foundBeer,
			user: foundUser,
			currentUser: currentUser,
			isCurrent: isCurrent,
			session: req.session,
			beerBrewery: beerBrewery,
			beerOwners: usersWithBeer,
			alreadyVoted: alreadyVoted
		});
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		// finding the beer
		const foundBeer = await Beer.findById(req.params.id);
		// finding all breweries
		const allBreweries = await Brewery.find({});
		// finding the user that created the beer
		const foundUser = await User.find({username: foundBeer.user});
		// finding the current logged in user
		const currentUser = await User.find({username: req.session.username});
		// sorting breweries alphabetically
		allBreweries.sort((a, b) => {
			let nameA = a.name.toUpperCase(); // ignore upper and lowercase
			let nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		// if the user logged in is the creator, they can edit
		if(req.session.username === foundBeer.user){
			res.render('beers/edit.ejs', {
				beer: foundBeer,
				breweries: allBreweries,
				session: req.session
			})
		/* if not, redirect if they try to follow this route in their URL
		the edit button will only appear if they are the creator */
		} else {
			res.redirect('/')
		}
	} catch (err) {
		res.send(err)
	}
});

// beer image upload
router.get('/:id/image', async (req, res) => {
	const foundBeer = await Beer.findById(req.params.id);
	const image = foundBeer.image;
	res.set('Content-Type', image.contentType);
	res.send(image.data);
});

// update --> put
router.put('/:id', upload.single('imageFile'), async (req, res) => {
	req.session.beerMessage = '';
	try {
		// update beer
		const updateBeer = await Beer.findByIdAndUpdate(req.params.id, req.body, { new: true });
		// find brewery with the beer being updated
		const beerBrewery = await Brewery.findOne({'beers._id': req.params.id});
		// find any user with the beer in their fridge, and return in an array
		const userFridge = await User.find({'fridge._id': req.params.id});
		// if there is an image to upload
		if (req.file) {
			console.log('inside');
			const imageFilePath = './uploads/' + req.file.filename;
			const newPicture = {};
			newPicture.image = {};
			newPicture.image.data = fs.readFileSync(imageFilePath);
			newPicture.image.contentType = req.file.mimetype;
			fs.unlinkSync(imageFilePath);
			updateBeer.image = newPicture.image;
			await updateBeer.save();
		}
		// if old brewery != new brewery
		if (beerBrewery.name.toString() != req.body.maker.toString()) {
			// remove beer
			beerBrewery.beers.id(req.params.id).remove();
			// save brewery
			await beerBrewery.save();
			// add beer to new brewery
			const newBrewery = await Brewery.findOne({name: req.body.maker});
			newBrewery.beers.push(updateBeer);
			// save new brewery
			await newBrewery.save();
		} else {
			// if old brewery = new brewery
			beerBrewery.beers.id(req.params.id).remove();
			beerBrewery.beers.push(updateBeer);
			await beerBrewery.save();
		}
		for (let i = 0; i < userFridge.length; i++) {
			userFridge[i].fridge.id(req.params.id).remove();
			// push new updated beer to user fridge    
			userFridge[i].fridge.push(updateBeer);
			// save user
			await userFridge[i].save();
		}
		res.redirect('/beers');
	} catch (err) {
		console.log(err)
		req.session.beerMessage = `Need a name and brewery`;
		res.redirect(`/beers/${req.params.id}/edit`);
	}
});

// upvoting mechanics
router.put('/:id/upvote/upvote', async (req, res) => {
	try {
		// finding creator
		const foundBeer = await Beer.findById(req.params.id);
		// finding out if user is logged in
		const currentUser = await User.findById(req.session._id);
		let alreadyVoted = false;
		// if they are logged in
		if (currentUser){
			for (let i = 0; i < foundBeer.plusOnes.length; i++) {
				// if they have already upvoted, they cannot upvote agaain
				if (foundBeer.plusOnes[i].toString() === currentUser._id.toString()) {
					alreadyVoted = true;
				}
			}
		} else {
			// if they are not logged in, they cannot upvote
			alreadyVoted = true;
		}
		if (alreadyVoted) {
			res.redirect(`/beers/${req.params.id}`)
		} else {
			// if they upvote, they cannot upvote again later
			foundBeer.plusOnes.push(currentUser._id);
			await foundBeer.save();
			res.redirect(`/beers/${req.params.id}`)
		}
	} catch (err) {
		res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		// find beer to delete
		const deleteBeer = await Beer.findByIdAndRemove(req.params.id);
		// find all users with beer in fridge
		const usersWithBeer = await User.find({'fridge._id': req.params.id});
		// find all breweries with that beer
		const breweryWithBeer = await Brewery.findOne({'beers._id': req.params.id});
		// remove beer from users' fridges that have it
		for (let i = 0; i < usersWithBeer.length; i++) {
			usersWithBeer[i].fridge.id(req.params.id).remove();
			await usersWithBeer[i].save();
		}
		// remove from breweries that have it
		breweryWithBeer.beers.id(req.params.id).remove();
		await breweryWithBeer.save();
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;