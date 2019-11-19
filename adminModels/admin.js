var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// Admin Schema
var AdminSchema = new schema({
	username: {
		type: String, required:true, index: true, unique:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	type: {
		type: String
	},
	privilidge_type: {
		type: schema.Types.ObjectId
	},
	privilidge: {
		type: String
	},
	gender: {
		type: String
	},
	pri_key: {
		type: String
	},
	pub_key: {
		type: String
	},
	status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Admin', AdminSchema);
