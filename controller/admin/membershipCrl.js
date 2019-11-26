var baseModel = require('../../models/baseModel');
var membership = require('../../adminModels/membership');
const mediaCrl = require('../mediaCrl');
var auth = require('../../models/auth/auth');

exports.addPackage = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }

  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  if(isEmpty(req.body.maxCurrentUser))  req.body.maxCurrentUser={};
  if(isEmpty(req.body.currentUserCalculation))  req.body.currentUserCalculation={};
  var data = {
    title: req.body.title,
    description: req.body.description,
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
    status: true,
    trans_max_num:req.body.trans_max_num,
    fees_percent:req.body.fees_percent
  }

  //console.log(data, req.body);
  baseModel.add(req, res, membership, data, callback1, true);
}

exports.getPackage = function (req, res, where, select, callback) {

  var callback1 = function (obj, error) {
    if (error) callback(false, error);
    else {
      var data = {
        _id: '',
        title: '',
        description: '',
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
        status: '',
        trans_max_num:'',
        fees_percent:''
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
        //else onepackges.currentUserCalculation = {};
        //if (onepackges.image != '') onepackges.image = auth.siteurl() + onepackges.image;
        if (onepackges.image != '') onepackges.image =  onepackges.image;
        result.push(onepackges);
      });
      callback(false, {data :{result , Url:auth.siteurl()}});
    }
  }
  baseModel.get(req, res, membership, where,{},callback1, true);
}

exports.updatePackage = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (obj.n) callback(true);
    else callback(false);
  }
  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  if(req.body.maxCurrentUser) req.body.maxCurrentUser= JSON.stringify(req.body.maxCurrentUser);
  baseModel.update(req, res, membership, { _id: req.params.id }, req.body, callback1, true);
}

exports.deletePackage = function (req, res, callback) {
  if(req.body.image){//remove old first
    mediaCrl.delete_old_images(req.body.image); 
  }
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req, res, membership, { _id: req.params.id }, callback1, false, true);
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
