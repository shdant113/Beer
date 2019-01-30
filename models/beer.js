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
	maker: { type: String, required: true },
	user: { type: String, required: true },
	image: {
		data: Buffer,
		contentType: String
	}
});

const Beer = mongoose.model('Beer', beerSchema);
module.exports = Beer;