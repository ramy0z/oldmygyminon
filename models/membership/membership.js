var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var membershipSchema = new schema({
	club_key: {
		type: String,
	},
	branch_key: {
		type: String
	},
  units_key: {
		type: String
	},
	branch_data : {type : String },
	units_data : {type : String },
	title: {
		type: String
	},
	type: {
		type: String
	},
	month_count: {
		type: String
	},
	month_system: {
		type: String
	},
	fees: {
		type: String
	},
	taxs: {
		type: String
	},
	payment_startegy: {
		type: String
	},
	discount: {
		type: String
	},
	renew_fees: {
		type: String
	},
	renew_taxs: {
		type: String
	},
	renew_discount: {
		type: String
	},
	discount_startegy: {
		type: String
	},
	start_discount: {
		type: String
	},
	end_discount: {
		type: String
	},
	image: {
		type: String
	},
	discriptions: {
		type: String
	},
	session_time: {
		type: String
	},
	day_per_week: {
		type: String
	},
	additional_visits : {
		type : String
	},
	additional_invitation : {
		type : String
	},
	additional_service : {
		type : String
	},status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

membershipSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('membership', membershipSchema);
