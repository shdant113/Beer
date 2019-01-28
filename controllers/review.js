const express = require('express');
const router = express.Router();
const Review = require('../models/review');

// index --> get
router.get('/', async (req, res) => {
	try {
		const foundReview = Review.find({});
		res.render('./review/index.ejs', {
			review: foundReview
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		res.render('./review/new.ejs');
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	try {
		const newReview = Review.create(req.body);
		res.redirect('/review')
	} catch (err) {
		res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		const foundReview = Review.findById(req.params.id);
		res.render('./review/show.ejs', {
			review: foundReview
		})
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundReview = Review.findById(req.params.id);
		res.render('./review/edit.ejs', {
			review: foundReview
		})
	} catch (err) {
		res.send(err)
	}
});

// update --> put
router.put('/:id', async (req, res) => {
	try {
		const updateReview = Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.redirect('/review')
	} catch (err) {
		res.send(err)
	}
});

// delete --> delete
router.delete('/:id', async (req, res) => {
	try {
		const deleteReview = Review.findByIdAndRemove(req.params.id);
	} catch (err) {
		res.send(err)
	}
});

module.exports = router;