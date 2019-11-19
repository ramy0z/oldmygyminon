var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var EmailsSchema = new schema({
	from: {
		type: String,

	},
	to: {
		type: String
	},
	reason: {
		type: String
	},
	author_key: {
		type: String
	},status: {
		type: String
	},all: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('emailslog', EmailsSchema);
