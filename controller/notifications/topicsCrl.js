var baseModel = require('../../models/baseModel');
var topics = require('../../models/notification/topics');

/**** add new row in token **/
exports.add = function(req,res,user_key,topic,token,callback){
  var addcallback = function(result,err){
    callback(result,err);
  }
  var where = {user_key,topic,token};
  var data = {user_key,topic,token};
  baseModel.updateoradd(req, res, topics, where, data, addcallback);
}


/**** add new row in token **/
exports.delete = function(req,res,user_key,topic,token,callback){
  var deletecallback = function(result,err){
    callback(result,err);
  }
  var where = {user_key,topic,token};
  baseModel.delete(req, res, topics, where, deletecallback);
}

/**** add new row in token **/
exports.get = function(req,res,where,callback){
  var getcallback = function(err,result){
    if(err) callback(result,true);
    else callback(result,false);
  }
  baseModel.get(req, res, topics, where, getcallback);
}
