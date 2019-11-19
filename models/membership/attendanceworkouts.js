var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var attendanceworkoutsSchema = new schema({
	author : {type : String },
    attendance_id : {type : schema.Types.ObjectId},
    workouts_ids : [],
	createdat: {type: Date,default: Date.now}
});

attendanceworkoutsSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('attendanceworkouts', attendanceworkoutsSchema);
