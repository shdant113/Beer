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
		const addBrewery = await Brewery.find({})
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
		const foundBrewery = await Brewery.findOne(req.params.id);
		const newBeer = await Beer.create(req.body);
		console.log(newBeer);
		foundBrewery.beers.push(newBeer);
		foundBrewery.save();
		console.log(newBeer);
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		const foundBeer = await Beer.findById(req.params.id);

		const foundUser = await User.findOne({username: req.session.username});
		if (foundUser) {
			res.render('beers/show.ejs', {
			beer: foundBeer,
			user: foundUser
			})
		} else {
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
		res.render('beers/edit.ejs', {
			beer: foundBeer
		})
	} catch (err) {
		res.send(err)
	}
});

// update --> put
router.put('/:id', async (req, res) => {
	try {
		const updateBeer = await Beer.findByIdAndUpdate(req.params.id, req.body, { new: true });
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