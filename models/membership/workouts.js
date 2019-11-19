var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var workoutsSchema = new schema({
    club_key: {type: String},
    category: {type: String},
    name: {type: String},
    description: {type: String},
    image_url:{type: String},
    video_url: {type: String},

	createdat: {type: Date,default: Date.now}
});

workoutsSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('workouts', workoutsSchema);
