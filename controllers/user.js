const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');


// log in page
router.get('/login', async (req, res) => {
	res.render('users/login.ejs')
});

// register page
router.get('/new', async (req, res) => {
	res.render('users/new.ejs')
});

// log in route
router.post('/login', async (req, res) => {
	try {
		const existingUser = await User.findOne({ username: req.body.username });
		if (!existingUser) {
			req.session.message = "here's a message";
			console.log('failed login attempt, username did not exist');
			res.redirect('/user/login');
		} else {
			if (bcrypt.compareSync(req.body.password, existingUser.password)) {
				req.session.username = existingUser.username;
				req.session.loggedIn = true;
				req.session.message = `We've been awaiting your prompt return, ${existingUser.username}`;
				res.redirect('/beers');
			} else {
				req.session.message = "here's a message";
				console.log('failed login attempt, incorrect password');
				res.redirect('/user/login');
			}
		}
	} catch (err) {
		res.send(err)
	}
});

// register route
router.post('/', async (req, res) => {
	// hash user password
	const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	const userPassEntry = {};
	userPassEntry.password = hashedUserPassword;
	userPassEntry.username = req.body.username;
	userPassEntry.email = req.body.email;
	userPassEntry.city = req.body.city;
	userPassEntry.state = req.body.state;
	try {
		// create user
		const newUser = await User.create(userPassEntry);
		console.log('newUser is: ')
		console.log(newUser);
		req.session.loggedIn = true;
		req.session.username = newUser.username // username
		req.session.message = `It's a pleasure to meet you, ${newUser.username}`;
		res.redirect('/');
	} catch (err) {
		res.send(err)
	}
});

// log out
router.get('/logout', async (req, res) => {
	req.session.destroy((err) => {
		res.redirect('/user/login')
	})
});

// index
router.get('/', async (req, res) => {
	try {
		const foundUser = await User.find({});
		res.render('users/index.ejs', {
			users: foundUser
		})
	} catch (err) {
		res.send(err)
	}
});

// 






module.exports = router;