var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = new schema({
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
		type: String,
		
	},
	type: {
		type: String
	},
	gender: {
		type: String,
        enum : ['Male', 'Female'],
        default: 'Male'
	},
	club_key: {
		type: String
	},
	branch_key: {
		type: String
	},
	units_key: {
		type: String
	},
	units_type: {
		type: String
	},
	pri_key: {
		type: String
	},
	pub_key: {
		type: String
	},
	status: {
		type:schema.Types.Mixed,
		default:false
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('User', UserSchema);
