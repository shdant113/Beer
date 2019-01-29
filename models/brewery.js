const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Beer = require('./beer');
const User = require('./user')
const brewerySchema = new Schema({
	name: { type: String, required: true, unique: true },
	city: String,
	state: String,
	creator: { type: String, required: true },
	beers: [Beer.schema]
})

const Brewery = mongoose.model("Brewery", brewerySchema);
module.exports = Brewery;