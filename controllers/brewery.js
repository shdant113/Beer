const express = require('express');
const router = express.Router();
const Brewery = require('../models/brewery');

// index --> get
router.get('/', async (req, res) => {
	try {
		const foundBrewery = await Brewery.find({});
		res.render('./breweries/index.ejs', {
			brewery: foundBrewery
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		res.render('./breweries/new.ejs');
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	try {
		const newBrewery = await Brewery.create(req.body);
		res.redirect('/breweries');
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		const foundBrewery = await Brewery.findById(req.params.id);
		res.render('./breweries/show.ejs', {
			brewery: foundBrewery
		})
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundBrewery = await Brewery.findById(req.params.id);
		res.render('./breweries/edit.ejs', {
			brewery: foundBrewery
		})
	} catch (err) {
		res.send(err)
	}
});

// update --> put
router.put('/:id', async (req, res) => {
	try {
		const updateBrewery = await Brewery.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.redirect('/breweries');
	} catch (err) {
		res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		const breweryDelete = await Brewery.findByIdAndRemove(req.params.id);
		res.redirect('/breweries');
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;