const express = require('express');
const router = express.Router();
const Beer = require('../models/beer');
const Brewery = require('../models/brewery');
const User = require('../models/user');

// index --> get
router.get('/', async (req, res) => {
	try {
		const allBeers = await Beer.find({});
		res.render('beers/index.ejs', {
			beers: allBeers
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		// find breweries for dropdown
		const addBrewery = await Brewery.find({})
		// find user for user option
		const foundUser = await User.findOne({ username: req.session.username });
		res.render('beers/new.ejs', {
			breweries: addBrewery,
			user: foundUser
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	try {
		// find brewery that was inputted
		const foundBrewery = await Brewery.findOne(req.params.id);
		// create the new beer
		const newBeer = await Beer.create(req.body);
		// console.log(newBeer);
		// push the new beer into the brewery it belongs in
		foundBrewery.beers.push(newBeer);
		foundBrewery.save();
		// console.log(newBeer);
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		// beer to show
		const foundBeer = await Beer.findById(req.params.id);
		// finding the user in order to determine if the user is logged in
		const foundUser = await User.findOne({username: req.session.username});
		if (foundUser) {
			// if the user is logged in, they can add the beer to their fridge
			res.render('beers/show.ejs', {
			beer: foundBeer,
			user: foundUser
			})
		} else {
			// if the user is not logged in (username of 0 cannot exist because username must be a string), they cannot add a beer to their fridge, so the page renders but the button does not show up
			res.render('beers/show.ejs', {
			beer: foundBeer,
			user: 0
			})
		}
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundBeer = await Beer.findById(req.params.id);
		const allBreweries = await Brewery.find({});
		res.render('beers/edit.ejs', {
			beer: foundBeer,
			breweries: allBreweries
		})
	} catch (err) {
		res.send(err)
	}
});

// update --> put
router.put('/:id', async (req, res) => {
	try {
		// update beer
		const updateBeer = await Beer.findByIdAndUpdate(req.params.id, req.body, { new: true });
		console.log('beer is: ' + updateBeer);
		// find brewery with the beer being updated
		const beerBrewery = await Brewery.findOne({'beers._id': req.params.id});
		console.log('brewery is: ' + beerBrewery);	
		// find any user with the beer in their fridge
		const userFridge = await User.find({'fridge._id': req.params.id});

		console.log(userFridge);
		console.log('users with this beer in fridge are: ' + userFridge);
		// if old brewery != new brewery
		if (beerBrewery._id.toString() != req.body.maker.toString()) {
			console.log('if')
			console.log(beerBrewery.name, req.body.maker);	
			// remove beer
			beerBrewery.beers.id(req.params.id).remove();
			// save brewery
			await beerBrewery.save();
			// add beer to new brewery
			const newBrewery = await Brewery.findById(req.body.maker);
			newBrewery.beers.push(updateBeer);
			// save new brewery
			await newBrewery.save();
		} else {
			console.log('else')
			// if old brewery = new brewery
			console.log(beerBrewery.name)
			beerBrewery.beers.id(req.params.id).remove();
			beerBrewery.beers.push(updateBeer);
			await beerBrewery.save();
		}
		console.log('past if else')
		console.log(req.params.id);
		console.log(userFridge);
		console.log("")
		console.log(userFridge.id);
		// remove beer from user fridge
		userFridge.fridge.id(req.params.id).remove();
		console.log('removed')
		// push new updated beer to user fridge    
		userFridge.fridge.push(updateBeer);
		// save user
		await userFridge.save();
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		const deleteBeer = await Beer.findByIdAndRemove(req.params.id);
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;