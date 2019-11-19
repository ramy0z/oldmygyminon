var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = new schema({
	key: {
		type: String
	},
	type: {
		type: String
	},
	privilidge: {
		type: String
	},
	default: {
		type: Boolean
	},
	status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Privilidgetype', UserSchema);
