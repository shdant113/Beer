const express = require('express');
const router = express.Router();
const Beer = require('../models/beer');

// index --> get
router.get('/', async (req, res) => {
	try {
		const foundBeer = Beer.find({});
		res.render('./beer/index.ejs')
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		res.render('./beer/new.ejs')
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	try {
		const newBeer = await Beer.create(req.body);
		res.redirect('/beers');
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		const foundBeer = await Beer.findById(req.params.id);
		res.render('./beers/show.ejs', {
			beer: foundBeer
		})
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundBeer = await Beer.findById(req.params.id);
		res.render('./beers/edit.ejs', {
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