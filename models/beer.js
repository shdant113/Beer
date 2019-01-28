const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const beerSchema = new Schema({
	name: { type: String, required: true },
	type: String,
	price: Number, // can be changed once we have a system set up
	flavor: String,
	color: String,
	rating: [Review.schema],
	maker: String,
	user: { type: String, required: true }
});

const Beer = mongoose.model('Beer', beerSchema);
module.exports = Beer;