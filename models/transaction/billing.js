var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var billingSchema = new schema({
    // month : {type : String },
    // data :{type: schema.Types.Mixed	},
	club: {type : String },
    start_date: {type : Date },
    end_date:{type : Date },
	sub_total: {type: Number},
    discount: {type: Number	},
    pay_percentage: {type: Number},
    package_title: {type : String },
    package_description: {type : String },
    trans_max_num: {type: Number},
    trans_amount: {type: Number	},
    club_revenus :{type: Number	},
    billing_method:{type : String , default : "" },
    payment_status : {type : String , default : "" },
    payment_date : {type : Date , default : null },
    payment_author : {type : String , default : "" },
	createdat : {type : Date,default : Date.now}
});

billingSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('billing', billingSchema);


