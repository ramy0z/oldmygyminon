var baseModel = require('../../models/baseModel');
var privilidgetype = require('../../adminModels/privilidgeType');

exports.getPrivilidgeType = function(req,res,where,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else{
    var data={
            _id : '',
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

  if(req.query.search){
    var search= req.query.search.toString();
    where['$and'].push({$or:[{'type':{'$regex': search }}]});
  }
  baseModel.get(req,res,privilidgetype,where,{},callback1,true);
}

exports.addPrivilidgeType = function(req,res,callback){
  var addPrivilidgeTypeCallback = function(obj,error){
    if(error) callback(obj,error);
    else callback(obj,false);
  }
  var data={privilidge:req.body.allPrivilidge,type:req.body.type,'default':req.body.default,status:true}
  baseModel.add(req,res,privilidgetype,data,addPrivilidgeTypeCallback,true);
}

exports.updatePrivilidgeType = function(req,res,callback){
  console.log(req.body);
  var callback1 = function(obj,error){
    if(obj.nModified) callback(true);
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
