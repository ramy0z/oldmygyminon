var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var confirmMailSchema = new schema({
	pub_key: {
		type: String
	},
	confirmcode: { 
		type: Number
	},
     submission: {
		type: Number
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('confirmMails', confirmMailSchema);
