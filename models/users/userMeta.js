var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = new schema({
	pub_key: {
		type: String,
		index:true
	},
	key: {
		type: String
	},
	value: {
		type:mongoose.Schema.Types.Mixed,
		maxlength: 63,
		required: function(){
		  return false;
		}
	},club_pub_key: {
		type: String
	},status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports =  mongoose.model('usermeta', UserSchema);
