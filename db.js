const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost/beer';

mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
});

mongoose.connection.on('connected', () => {
	console.log("");
	console.log('yee');
	console.log("");
});

mongoose.connection.on('disconnected', () => {
	console.log("");
	console.log('no');
	console.log("");
});

mongoose.connection.on('error', (err) => {
	console.log("");
	console.log('aw');
	console.log("");
	console.log(err);
	console.log("");
})