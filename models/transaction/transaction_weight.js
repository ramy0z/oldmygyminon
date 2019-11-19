var mongoose = require('mongoose');
var schema = mongoose.Schema;

// transaction_weight Schema
var transaction_weight = new schema({
	club : {type : String },
	name : {type : String },
	trans_key_state: {type : String},
	weight : {type : Number },
	calc : {type : Number },
	createdat : {type : Date,default : Date.now}
});

transaction_weight.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('transaction_weight', transaction_weight);
