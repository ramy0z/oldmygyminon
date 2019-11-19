var mongoose = require('mongoose');
var schema = mongoose.Schema;

// User Schema
var logSchema = new schema({
	author : {type : String },
	log_key_state: {type : String},
	action : {type : String },
	club: {type: String	},
	branch: {type: String	},
	units: {type: String	},
	table: {type: String	},
	ref_id : {type : schema.Types.ObjectId },
	pref_id : {type : schema.Types.ObjectId },
	trans_num: {type : Number , default : 1 },
	ref_scadual_arr :[],
	pref_scadual_arr : [],
	// oldchange : {type : String },
	// newchange : {type : String },
	createdat : {type : Date,default : Date.now}
});

logSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret.__v;
    }
})

module.exports  = mongoose.model('log', logSchema);
