const express = require('express');
const router = express.Router();
const Brewery = require('../models/brewery');
const User = require('../models/user')

// index --> get
router.get('/', async (req, res) => {
	try {
		const currentUser = await User.findOne({username: req.session.username});
		const allBreweries = await Brewery.find({});
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
		res.render('./breweries/index.ejs', {
			breweries: allBreweries,
			currentUser: currentUser
		})
	} catch (err) {
		res.send(err)
	}
});

// new --> get
router.get('/new', async (req, res) => {
	try {
		// const foundUser = await User.find({});
		res.render('./breweries/new.ejs', {
			user: req.session.username
		});
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
		// finding brewery
		const foundBrewery = await Brewery.findById(req.params.id);
		// finding user that created the brewery
		const foundUser = await User.findOne({ username: foundBrewery.creator });
		const currentUser = await User.findOne({username: req.session.username});
		let isCurrent = false;
		if (currentUser === null) {
			isCurrent = false;
		} else if (foundUser._id.toString() !== currentUser._id.toString()) {
			isCurrent = false;
		} else {
			isCurrent = true;
		}
		res.render('./breweries/show.ejs', {
			brewery: foundBrewery,
			user: foundUser,
			currentUser: currentUser,
			isCurrent: isCurrent
		})
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		const foundBrewery = await Brewery.findById(req.params.id);
		const foundMaker = await User.find({username: foundBrewery.creator});
		if(req.session.username === foundBrewery.creator) {
			res.render('./breweries/edit.ejs', {
				brewery: foundBrewery
			})
		} else {
			res.redirect('/');
		}
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