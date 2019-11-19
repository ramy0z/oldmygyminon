var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var monthtransactionSchema = new schema({
	month : {type : String },
	transDetails:{type: schema.Types.Mixed	},
	// club: {type : String },
	// branch : {type : String },
	// calc:{type : Number },
	// tTrans: {type: Number	},
	// tRevneu: {type: Number	},
	createdat : {type : Date,default : Date.now}
});

monthtransactionSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('monthtransaction', monthtransactionSchema);