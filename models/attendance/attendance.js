var mongoose = require('mongoose');
var schema = mongoose.Schema;
// User Schema
var attendanceSchema = new schema({
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
	trainer_key: {
		type: String
	},
	shift_id: {
		type: schema.Types.ObjectId
	},
	day: {
		type: String
	},
	from: {
		type: String
	},
	to: { 
		type: String
	},
	membershipandpayment_id :{
		type : schema.Types.ObjectId
	},
	membership_name:{
    type:String
	},
	status: {
		type: String,
		default:true
	},
	createdat: {
		type: Date,
		default: Date.now
	},
	checkin:{type:Date},
	checkinDay:String
});

attendanceSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('attendance', attendanceSchema);
