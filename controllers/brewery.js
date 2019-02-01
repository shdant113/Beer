const express = require('express');
const router = express.Router();
const Brewery = require('../models/brewery');
const User = require('../models/user')

// index --> get
router.get('/', async (req, res) => {
	try {
		// find current logged in user
		const currentUser = await User.findOne({username: req.session.username});
		// find all breweries
		const allBreweries = await Brewery.find({});
		// sort breweries alphabetically
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
		res.render('./breweries/new.ejs', {
			user: req.session.username,
			session: req.session
		});
	} catch (err) {
		res.send(err)
	}
});

// new --> post
router.post('/', async (req, res) => {
	req.session.breweryMessage = '';
	try {
		const newBrewery = await Brewery.create(req.body);
		res.redirect('/breweries');
	} catch (err) {
		req.session.breweryMessage = `Brewery needs a name cannot be duplicated`;
		res.redirect('/breweries/new')
		// res.send(err)
	}
});

// show --> get
router.get('/:id', async (req, res) => {
	try {
		// finding brewery
		const foundBrewery = await Brewery.findById(req.params.id);
		// finding user that created the brewery
		const foundUser = await User.findOne({ username: foundBrewery.creator });
		// finding the current logged in user
		const currentUser = await User.findOne({username: req.session.username});
		// sorting breweries alphabetically
		foundBrewery.beers.sort((a, b) => {
			let nameA = a.name.toUpperCase(); // ignore upper and lowercase
			let nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		});
		// determining if the current user created the brewery (only the creator can edit)
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
			isCurrent: isCurrent,
			session: req.session
		})
	} catch (err) {
		res.send(err)
	}
});

// edit --> get
router.get('/:id/edit', async (req, res) => {
	try {
		// find brewery by its id
		const foundBrewery = await Brewery.findById(req.params.id);
		// find the creator of the brewery
		const foundMaker = await User.find({username: foundBrewery.creator});
		/* only allow this route if the creator is the logged in user
		button will not show if not the creator, but this is a failsafe
		if a user typed in the route in the URL */
		if(req.session.username === foundBrewery.creator) {
			res.render('./breweries/edit.ejs', {
				brewery: foundBrewery,
				session: req.session
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
	req.session.breweryMessage = '';
	try {
		// find brewery to update, update it with given info	
		const updateBrewery = await Brewery.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.redirect('/breweries');
	} catch (err) {
		req.session.breweryMessage = `Brewery needs a name cannot be duplicated`;
		res.redirect(`/breweries/${req.params.id}/edit`)
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