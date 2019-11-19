var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var unitresourceSchema = new schema({
	club_key: {
		type: String,
	},
	branch_key: {
		type: String
	},
  units_key: {
		type: String
	},
	title: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

unitresourceSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('unitresource', unitresourceSchema);
