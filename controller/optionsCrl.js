var baseModel = require('../models/baseModel');
var option = require('../models/option');

exports.getOption = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else{
      var newobject = new Object();
      Object.keys(obj).forEach(function(key) {
        if(obj[key].value === 'true') var value = true;
        else if(obj[key].value === 'false') var value = false;
        else if(isJson(obj[key].value)) var value = JSON.parse(obj[key].value);
        else var value = obj[key].value;
        newobject[obj[key].key] = value;
      });
      callback(newobject,false);
    }
  }
  baseModel.get(req,res,option,where,select,callback1,true);
}

exports.updateOption = function(req,res,callback){
  var callback1 = function(obj,error){
    if(obj.n) callback(true);
    else callback(false);
  }
  var where = {key:req.body.key,pub_key:req.query.parent_key};
  var data = {key:req.body.key,value:req.body.value,pub_key:req.query.parent_key,status:true}
  baseModel.updateoradd(req,res,option,where,data,callback1,true);
}

exports.deleteOption = function(req,res,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req,res,option,{key:req.body.key,pub_key:req.query.public_key},callback1,false,true);
}


//check if string is valid json
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
