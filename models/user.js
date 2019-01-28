const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Beer = require('./beer');
const userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	email: { type: String, required: true },
	city: String,
	state: String,
	fridge: [Beer.schema]
});

const User = mongoose.model('User', userSchema);
module.exports = User;