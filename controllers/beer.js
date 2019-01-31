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
		const currentUser = await User.findOne({username: req.session.username});
		const allBeers = await Beer.find({});
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
		// console.log(addBrewery);

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



		// addBrewery.sort((a, b) => {
		// 	return a.name - b.name
		// })
		// await addBrewery.save();
		// find user for user option
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
		// console.log(newBeer);
		// push the new beer into the brewery it belongs in
		foundBrewery.beers.push(newBeer);
		await foundBrewery.save();
		// console.log(newBeer);
		res.redirect('/beers');
	} catch (err) {
		req.session.beerMessage = `Need a name and brewery`;
		res.redirect('/beers/new');
		// res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		// beer to show
		const foundBeer = await Beer.findById(req.params.id);
		const beerBrewery = await Brewery.findOne({'beers._id': req.params.id});
		// finding the user in order to determine if the user is logged in
		const currentUser = await User.findOne({username: req.session.username});
		const foundUser = await User.findOne({username: foundBeer.user});
		const usersWithBeer = await User.find({'fridge._id': req.params.id});
		let isCurrent = false;
		if (currentUser === null) {
			isCurrent = false;
		} else if (foundUser._id.toString() !== currentUser._id.toString()) {
			isCurrent = false;
		} else {
			isCurrent = true;
		}
		// if (currentUser) {
			// if the user is logged in, they can add the beer to their fridge
		res.render('beers/show.ejs', {
			beer: foundBeer,
			user: foundUser,
			currentUser: currentUser,
			isCurrent: isCurrent,
			session: req.session,
			beerBrewery: beerBrewery,
			beerOwners: usersWithBeer
		})
		// } else {
			// if the user is not logged in (username of 0 cannot exist because username must be a string), they cannot add a beer to their fridge, so the page renders but the button does not show up
			// res.render('beers/show.ejs', {
			// 	beer: foundBeer,
			// 	user: 0
			// })
		// }
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundBeer = await Beer.findById(req.params.id);
		const allBreweries = await Brewery.find({});
		const foundUser = await User.find({username: foundBeer.user});
		const currentUser = await User.find({username: req.session.username});
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
		if(req.session.username === foundBeer.user){
			res.render('beers/edit.ejs', {
				beer: foundBeer,
				breweries: allBreweries,
				session: req.session
			})
		} else {
			res.redirect('/')
		}
	} catch (err) {
		res.send(err)
	}
});

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
		if (req.file) {
			console.log('inside');
			const imageFilePath = './uploads/' + req.file.filename;
			const newPicture = {};
			newPicture.image = {};
			newPicture.image.data = fs.readFileSync(imageFilePath);
			newPicture.image.contentType = req.file.mimetype;
			fs.unlinkSync(imageFilePath);
			// console.log(newPicture);
			updateBeer.image = newPicture.image;
			await updateBeer.save();
			// console.log(updateBeer.picture);
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
		req.session.beerMessage = `Need a name and brewery`;
		res.redirect(`/beers/${req.params.id}/edit`);
		// res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		const deleteBeer = await Beer.findByIdAndRemove(req.params.id);
		const usersWithBeer = await User.find({'fridge._id': req.params.id});
		const breweryWithBeer = await Brewery.findOne({'beers._id': req.params.id});
		for (let i = 0; i < usersWithBeer.length; i++) {
			usersWithBeer[i].fridge.id(req.params.id).remove();
			await usersWithBeer[i].save();
		}
		breweryWithBeer.beers.id(req.params.id).remove();
		await breweryWithBeer.save();
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;