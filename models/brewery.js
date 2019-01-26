const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const brewerySchema = new Schema({
	name: { type: String, required: true },
	location: { type: String, required: true },
	beers: [Beer.schema]
})