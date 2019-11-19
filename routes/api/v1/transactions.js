var express = require('express');
var router = express.Router();
var auth = require('../../../models/auth/auth');
var tranaction = require('../../../controller/monthtransactionCrl');

router.post('/calculateTransactions', function(req, res, next) {
  var callback = function(err,data) {
    if(! err) res.send({result:true,data});
    else res.send({result:false,data:[]});
  }
  var today = new Date();
  var month = [today.getMonth()+1+'-'+today.getFullYear()];
  if(req.body.month)  month = req.body.month;
  if(req.body.account_key) var account_key =req.body.account_key;
  else var account_key = req.query.parent_key;
  var where = {month:{$in:month},account_key}
  tranaction.calculateTransaction(req,res,where,callback);
});


module.exports = router;
