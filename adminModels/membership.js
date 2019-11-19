var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var adminmembershipSchema = new schema({
	title: {type: String	},
	description: {type: String	},
	maxCurrentUser: {type: String	},
	currentUserCalculation: {type: schema.Types.Mixed},
	maxBranchNumber: {type: String	},
	maxUnitsNumber: {type: String	},
	billingMethod: {type: String	},
	supportWay: {type: String	},
	supportRepondingPeriod: {type: String	},
	fees: {type: String	},
	discount: {type: String	},
	image: {type: String	},
	status: {type: String	},
	trans_max_num: {type: Number},
	fees_percent: {type: Number	},
	createdat: {type: Date,default: Date.now
	}
});

adminmembershipSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports = mongoose.model('adminmembership', adminmembershipSchema);
