const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');


// log in page
router.get('/login', async (req, res) => {
	res.render('./user/login.ejs')
});

// register page
router.get('/register', async (req, res) => {
	res.render('./user/register.ejs')
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
				res.session.loggedIn = true;
				req.session.message = `We've been awaiting your prompt return, ${existingUser.username}`;
				res.redirect('/beer/index.ejs');
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
router.post('/register', async (req, res) => {
	try {
		const existingUser = await User.findOne({ username: req.body.username });
		if (!existingUser) {
			// hash user password
			const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(20));
			// create user
			const newUser = await User.create({
				username: req.body.username,
				password: hashedUserPassword,
				email: req.body.email,
				location: req.body.location
			})
			req.session.loggedIn = true;
			req.session.username = newUser.username // username
			req.session.message = `It's a pleasure to meet you, ${newUser.username}`;
			res.redirect('/beer');
		} else {
			req.session.message = `Username ${existingUser.username} already taken.`
			res.redirect('/user/register');
		}
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

module.exports = router;