var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var adminselectedmembershipSchema = new schema({
	account_key : {type : String },
	membership_id : {type : schema.Types.ObjectId },
	maxCurrentUser: {type: String	},
	currentUserCalculation: {type: String	},
	maxBranchNumber: {type: String	},
	maxUnitsNumber: {type: String	},
	billingMethod: {type: String	},
	supportWay: {type: String	},
	supportRepondingPeriod: {type: String	},
	fees: {type: String	},
	discount: {type: String	},
	status : {type : String },
	createdat : {type : Date,default : Date.now}
});

adminselectedmembershipSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('adminselectedmembership', adminselectedmembershipSchema);
