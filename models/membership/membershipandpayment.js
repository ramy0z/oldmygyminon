var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var membershipandpaymentSchema = new schema({
	club_key : {type : String },
	branch_key : {type : String },
	branch_country:{type:String},
	branch_city:{type:String},
	branch_lang:{type:String},
	branch_lat:{type:String},
	units_key : {type : String },
	type : {type : String },
	pub_key : {type : String },
	membership_id : {type : schema.Types.ObjectId },
	privious_membership_id : {type : schema.Types.ObjectId },
	renew_membership_id : {type : schema.Types.ObjectId },
	next_membership_id : {type : schema.Types.ObjectId },
	renew_membership_id : {type : schema.Types.ObjectId },
  	payment_startegy : {type : String },
	payment_status : {type : String },
	payment_method : {type : String },
	payment_date : {type : String },
	payment_action : {type : String },
	payment_refund : {type : String },
	payment_additional : {type : String },
	schedual_status : {type : String },
	agreement : {type : String },
	discount : {type : String },
	hours : {type : String },
	fees : {type : String },
	original_fees : {type : String },
	start_date : {type : String },
	end_date : {type : String },
	visits : {type : String },
	additional_visits : {type : String },
	additional_invitation : {type : String },
	additional_service : {type : String },
	status : {type : String },
	membership_status:{type:String },
	createdat : {type : Date,default : Date.now}
});

membershipandpaymentSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('membershipandpayment', membershipandpaymentSchema);
