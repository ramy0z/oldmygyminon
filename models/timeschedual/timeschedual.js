var mongoose = require('mongoose');
var schema = mongoose.Schema;
// User Schema
var timeschedualSchema = new schema({
	shift_id: {
		type: schema.Types.ObjectId
	},
	interval: {
		type: String
	},
	day_date: {
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

timeschedualSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('timeschedual', timeschedualSchema);
