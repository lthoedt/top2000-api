require('./Users');
require('./Songs');

const mongoose = require('mongoose');

const url = require('./config').mongoURI;
// test url
// const url = require('./config').testMongoURI;

const db = mongoose.connection;
const Users = mongoose.model('Users');
const Songs = mongoose.model(String(new Date().getFullYear()));

const createDatabase = async () => {
	await mongoose.connect(url, {
		useNewUrlParser: true
	})

    await Users.createCollection();
    await Songs.createCollection();

	mongoose.connection.on('error', err => {
		console.log(err);
	});
}

createDatabase();

module.exports = {
	url,
	Users,
    Songs,
}