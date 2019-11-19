var baseModel = require('../models/baseModel');
var monthtransactions = require('../models/transaction/monthtransaction');

exports.addTransaction = function (req, res,where, data=false,callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }
  if(!data){
    var data = {
      account_key : req.body.account_key,
      transactions: req.body.transactions,
    	month: req.body.month,
    	billingMethod: req.body.billingMethod,
    	fees: req.body.fees,
    	discount: req.body.discount,
      status: 'active'
    }
  }
  baseModel.updateoradd(req, res, monthtransactions,where, data, callback1, true);
}

exports.getTransaction = function (req, res, where, select, callback) {
  var callback1 = function (obj, error) {

    if (error) callback(false, error);
    else {
      var data = {
        _id: '',
        account_key : '',
        month :'',
        transactions:'',
        billingMethod:'',
        fees: 0,
        discount: '',
        status: ''
      }
      var result = new Array();
      var i = 1;

      Object.keys(obj).forEach(function (key) {
        var package = obj[key];
        var onepackges = new Object(); onepackges['increment'] = i; i++;
        Object.keys(data).forEach(function (index) {
          if (package[index] != undefined) onepackges[index] = package[index];
          else onepackges[index] = data[index];
        });
        if (isJson(onepackges.transactions)) onepackges.transactions = JSON.parse(onepackges.transactions);
        else onepackges.transactions = [];
        result.push(onepackges);
      });
      callback(false, result);
    }
  }
  baseModel.get(req, res, monthtransactions, where,select,callback1, true);
}

exports.updateTransaction = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (obj.n) callback(true);
    else callback(false);
  }
  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  baseModel.update(req, res, monthtransactions, { _id: req.params.id }, req.body, callback1, true);
}

exports.deleteTransaction = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req, res, monthtransactions, { _id: req.params.id }, callback1, false, true);
}

exports.calculateTransaction =  function (req, res,where,callback) {
  var getcallback = function(err,alltransactions){
      var result= {data:new Array(),total:0};var total = 0;
      Object.values(alltransactions).forEach(function(tranaction) {
        var subtotal = 0;
        if(isJson(tranaction.transactions)) transactions =JSON.parse(tranaction.transactions);
        else transactions =[];
          Object.values(transactions).forEach(function(trans) {
            subtotal = subtotal+(parseInt(trans.value)*((parseInt(trans.fees)*parseInt(trans.total))/100));
          })
          total =  total+subtotal;
          result['data'].push({transactions,subtotal});
      })
      result['total'] = total;
    callback(err,result);
  }
  this.getTransaction(req, res,where,getcallback);
}

function isEmpty(obj) {
  for(var key in obj) {
  if(obj.hasOwnProperty(key)) return false;
    }return true;
}
//check if string is valid json
function isJson(str) {
  try {JSON.parse(str);}
  catch (e) {return false;}
  return true;
}
