const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Beer = require('./beer');
const User = require('./user')
const brewerySchema = new Schema({
	name: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	creator: { type: String, required: true},
	beers: [Beer.schema]
})

const Brewery = mongoose.model("Brewery", brewerySchema);
module.exports = Brewery;