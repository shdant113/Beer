require('./db');
const express = require('express');
const server = express();
const request = require('superagent');


const bodyParser = require('body-parser');
const methodOverride = require('method-override');

server.use(express.static('public'));
server.use(methodOverride('_method'));
server.use(bodyParser.urlencoded({extended: false}));

server.listen(3000, () => {
	console.log('get to da choppa')
})