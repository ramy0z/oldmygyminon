var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var TopicsSchema = new schema({
  topic: {
		type: String
	},
  user_key: {
		type: String
	},
	token: {
		type: String
	},status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('topic', TopicsSchema);
