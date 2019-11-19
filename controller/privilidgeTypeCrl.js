var baseModel = require('../models/baseModel');
var privilidgetype = require('../models/users/privilidgeType');

exports.getPrivilidgeType = function(req,res,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else{
    var data={
            _id : '',
            key: '',
            privilidge: '',
            type: '',
            default: false,
            status : ''
          }
          var result = new Array();
          var i=1;
          Object.keys(obj).forEach(function(key) {
            var privilidgetype = obj[key];
              var oneprivilidgetype = new Object(); oneprivilidgetype['increment']=i;i++;
            Object.keys(data).forEach(function(index) {

              if(privilidgetype[index] != undefined) oneprivilidgetype[index]=privilidgetype[index];
              else oneprivilidgetype[index]=data[index];
            });

            result.push(oneprivilidgetype);
        });
      callback(result,false);
    }
  }
  var where={key:req.query.parent_key,$and:[{}]}
  if(req.query.search){
    var search= req.query.search.toString();
    where['$and'].push({$or:[{'type':{'$regex': search }}]});
  }
  baseModel.get(req,res,privilidgetype,where,{},callback1,true);
}

exports.addPrivilidgeType = function(req,res,callback){
  var addPrivilidgeTypeCallback = function(obj,error){
    if(error) callback(obj,error);
    else {
      if(req.body.default == 'true'){
        var updatePrivilidgeTypeCallback = function(obj,error){}
        var where={key:req.query.parent_key,default:true,_id:{ $ne: obj._id }}
        baseModel.update(req,res,privilidgetype,where,{default:false},updatePrivilidgeTypeCallback,true);
      }
      callback(obj,false);
    }
  }
  var data={key:req.query.parent_key,privilidge:req.body.allPrivilidge,type:req.body.type,'default':req.body.default,status:true}
  console.log(data);
  baseModel.add(req,res,privilidgetype,data,addPrivilidgeTypeCallback,true);
}

exports.updatePrivilidgeType = function(req,res,callback){
  console.log(req.body);
  var callback1 = function(obj,error){
    if(obj.nModified) {
      if(req.body.default){
        var updatePrivilidgeTypeCallback = function(obj,error){}
        var where={key:req.query.parent_key,default:true,_id:{ $ne: req.params.id }}
        console.log(req.body.default,where);
        baseModel.update(req,res,privilidgetype,where,{default:false},updatePrivilidgeTypeCallback,true);
      }
      callback(true);
    }
    else callback(false);
  }
  var data={'privilidge':req.body.allPrivilidge,'type':req.body.type,'default':req.body.default};
  baseModel.update(req,res,privilidgetype,{_id:req.params.id},data,callback1,false,true);
}

exports.deletePrivilidgeType = function(req,res,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req,res,privilidgetype,{_id:req.params.id},callback1,false,true);
}

exports.getPrivilidgeTypeByWhere = function(req,res,where,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else callback(obj,false);
  }
  baseModel.get(req,res,privilidgetype,where,{},callback1,true);
}
