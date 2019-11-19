var baseModel = require('../models/baseModel');
var unitresource = require('../models/unitresource/unitresource');
//var option = require('./optionsCrl');

exports.addResource = function(req,res,callback){
      var callback1 = function(obj,error){
        if(error) callback(obj,error);
        else callback(obj,false);
      }
      var data={
        club_key : req.body.club_key,
        branch_key : req.body.branch_key,
        units_key : req.body.units_key,
        title : req.body.title,
        status : true
      }
      baseModel.add(req,res,unitresource,data,callback1,true);

} 

exports.getResource = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    if(error) callback([],true);
    else {
      var data ={
            "_id": "",
            "club_key": "",
            "branch_key": "",
            "units_key": "",
            "title": ""
            }

        var result = new Array();
        var i=1;
        Object.keys(obj).forEach(function(key) {
          var resource = obj[key];
            var oneresource = new Object(); oneresource['increment']=i;i++;
          Object.keys(data).forEach(function(index) {

            if(resource[index] != undefined) oneresource[index]=resource[index];
            else oneresource[index]=data[index];
          });
          result.push(oneresource);
        });
        callback(result,false);
    }
  }
  baseModel.get(req,res,unitresource,where,select,callback1,true);
}

exports.updateResource = function(req,res,callback){
  var callback1 = function(obj,error){
    if(obj.n) callback(true);
    else callback(false);
  }
  var data={
    title : req.body.title,
    status : true
  }
  baseModel.updateoradd(req,res,unitresource,{_id:req.params.id},data,callback1,true);
}

exports.deleteResource = function(req,res,where,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req,res,unitresource,where,callback1,true,true);
}
