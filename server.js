require('./db');
const express = require('express');
const server = express();
const request = require('superagent');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

server.use(express.static('public'));
server.use(methodOverride('_method'));
server.use(bodyParser.urlencoded({extended: false}));
server.use(session({
	secret: 'TO BE SET LATER',
	resave: false,
	saveUnititialized: false
}))

server.listen(3000, () => {
	const date = new Date(Date.now())
	const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' })
	console.log(date);
	console.log('Today is ' + dayOfWeek);
	console.log(`get to da choppa`)
})