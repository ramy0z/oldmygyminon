var mongoose = require('mongoose');
var schema = mongoose.Schema;
// User Schema
var shiftSchema = new schema({
	club_key: {
		type: String,
	},
	branch_key: {
		type: String
	},
    units_key: {
		type: String
	},
	user_key: {
		type: String
	},
	shift_type: {
		type: String
	},
	day_per_week: {
		type: String
	},
	from_time: {
		type: String
	},
	to_time: {
		type: String
	},
	from_day: {
		type: String
	},
	to_day: {
		type: String
	},
	resource_id: {
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

shiftSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('shift', shiftSchema);
