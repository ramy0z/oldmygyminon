var mongoose = require('mongoose');
var schema = mongoose.Schema;
//var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = new schema({
	parent_key: {
		type: String
	},
	key: {
		type: String
	},
	privilidge: {
		type: schema.Types.Mixed
	},admin_key:{
		type: String
	},type:{
		type: schema.Types.ObjectId
	},
	status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('allprivilidge', UserSchema);
