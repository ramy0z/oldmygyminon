var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var NotificationsSchema = new schema({
  club_key: {
		type: String,
	},
  branch_key: {
		type: String,
	},
  units_key: {
		type: String,
	},
	user_key: {
		type: String,
	},
	author_key: {
		type: String
	},
	title: {
		type: String
	},
  body: {
		type: String
	},
  data: {
		type: String
	},
  link: {
		type: String
	},
	reason: {
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

module.exports = mongoose.model('notification', NotificationsSchema);
