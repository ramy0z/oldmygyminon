var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var activiteSchema = new schema({
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
	// month_count: {
	// 	type: String
	// },
	// month_system: {
	// 	type: String
	// },
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
	// day_per_week: {
	// 	type: String
	// },
	users_count: {
		type: String
	},
	type: {
		type: String
	},
	session_count: {
		type: String
	},
	start_date: {
		type: String
	},
	end_date: {
		type: String
	},
	schedual_time: {
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
	},
	status: {
		type: String
	},
	createdat: {
		type: Date,
		default: Date.now
	}
});

activiteSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('activite', activiteSchema);
