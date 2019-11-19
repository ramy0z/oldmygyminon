var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var OptionSchema = new schema({
	key: {
		type: String
	},
	value: { 
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

module.exports = mongoose.model('option', OptionSchema);
