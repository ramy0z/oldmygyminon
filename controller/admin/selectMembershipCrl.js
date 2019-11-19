var baseModel = require('../../models/baseModel');
var selectmembership = require('../../adminModels/selectmembership');

exports.addPackage = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }

  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  if(isEmpty(req.body.maxCurrentUser))  req.body.maxCurrentUser={};
  if(isEmpty(req.body.currentUserCalculation))  req.body.currentUserCalculation={};
  var data = {
    account_key : req.body.account_key,
    membership_id : req.body.membership_id,
    maxCurrentUser: JSON.stringify(req.body.maxCurrentUser),
  	currentUserCalculation: JSON.stringify(req.body.currentUserCalculation),
  	maxBranchNumber: req.body.maxBranchNumber,
  	maxUnitsNumber: req.body.maxUnitsNumber,
  	billingMethod: req.body.billingMethod,
  	supportWay: req.body.supportWay,
  	supportRepondingPeriod: req.body.supportRepondingPeriod,
  	fees: req.body.fees,
  	discount: req.body.discount,
    image: req.body.image,
    status: true
  }

  //console.log(data, req.body);
  baseModel.add(req, res, selectmembership, data, callback1, true);
}

exports.getPackage = function (req, res, where, select, callback) {

  var callback1 = function (obj, error) {
    if (error) callback(false, error);
    else {
      var data = {
        _id: '',
        account_key : '',
        membership_id :'',
        maxCurrentUser:'',
        currentUserCalculation:'',
        maxBranchNumber:'',
        maxUnitsNumber:'',
        billingMethod:'',
        supportWay:'',
        supportRepondingPeriod:'',
        fees: 0,
        discount: '',
        image: '',
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
        if (isJson(onepackges.maxCurrentUser)) onepackges.maxCurrentUser = JSON.parse(onepackges.maxCurrentUser);
        else onepackges.maxCurrentUser = {};
        if (isJson(onepackges.currentUserCalculation)) onepackges.currentUserCalculation = JSON.parse(onepackges.currentUserCalculation);
        else onepackges.currentUserCalculation = {};
        if (onepackges.image != '') onepackges.image = auth.siteurl() + onepackges.image;
        result.push(onepackges);
      });
      callback(false, result);
    }
  }
  baseModel.get(req, res, selectmembership, where,{},callback1, true);
}

exports.updatePackage = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (obj.n) callback(true);
    else callback(false);
  }
  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  baseModel.update(req, res, selectmembership, { _id: req.params.id }, req.body, callback1, true);
}

exports.deletePackage = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req, res, selectmembership, { _id: req.params.id }, callback1, false, true);
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
