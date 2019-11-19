var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// Privilidge Schema
var PrivilidgeSchema = new schema({
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

module.exports = mongoose.model('AdminPrivilidgeType', PrivilidgeSchema);
