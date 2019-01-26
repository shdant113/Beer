const express = require('express');
const router = express.Router();
const Brewery = require('../models/brewery');

// index --> get
router.get('/', async (req, res) => {
	try {
		const foundBrewery = await Brewery.find({});
		res.render('./brewery/index.ejs', {
			brewery: foundBrewery
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		res.render('./brewery/new.ejs');
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	try {
		const newBrewery = await Brewery.create(req.body);
		res.redirect('/brewery');
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		const foundBrewery = await Brewery.findById(req.params.id);
		res.render('./brewery/show.ejs', {
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
		res.render('./brewery/edit.ejs', {
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
		res.redirect('/brewery');
	} catch (err) {
		res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		const breweryDelete = await Brewery.findByIdAndRemove(req.params.id);
		res.redirect('/brewery');
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;