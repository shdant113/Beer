require('./db');
const express = require('express');
const server = express();
const request = require('superagent');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const User = require('./models/user');
const Brewery = require('./models/brewery');
const userSeed = require('./seedUserData');
const brewerySeed = require('./seedBreweryData');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');


server.use(express.static('public'));
server.use(methodOverride('_method'));
server.use(bodyParser.urlencoded({extended: false}));
server.use(session({
	secret: 'TO BE SET LATER',
	resave: false,
	saveUnititialized: false
}))

const beerController = require('./controllers/beer');
const breweryController = require('./controllers/brewery');
const reviewController = require('./controllers/review');
const userController = require('./controllers/user');

server.use('/beers', beerController);
server.use('/breweries', breweryController);
server.use('/reviews', reviewController);
server.use('/users', userController);

// Brewery.collection.insertMany(brewerySeed, (err, response) => {
// 	if (err) {
// 		console.log(err)
// 	} else {
// 		console.log(response)
// 	}
// });

server.get('/', (req, res) => {
	res.render('home.ejs', {
		session: req.session
	})
});

server.listen(3000, () => {
	const date = new Date(Date.now())
	const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' })
	console.log(date);
	console.log('Today is ' + dayOfWeek);
	console.log(`get to da choppa`)
})