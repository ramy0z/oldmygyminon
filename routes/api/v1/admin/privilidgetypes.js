var express = require('express');
var router = express.Router();
var privilidgetype = require('../../../../controller/privilidgeTypeCrl');
var auth = require('../../../../models/auth/auth');
/* GET api listing. */
//add privilidgetype
router.post('/PrivilidgeType', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) 
      {
        if(result)
        res.send({result:true,data:result})
        else
        res.send({result:false,data:{}})

      }
      else res.send({result:false});
    }
    privilidgetype.addPrivilidgeType(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'addprivilidgestype',true);
});
//update privilidgetype
router.patch('/PrivilidgeType/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    privilidgetype.updatePrivilidgeType(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editprivilidgestype',true);
});
//get privilidgetype
router.get('/PrivilidgeType', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    privilidgetype.getPrivilidgeType(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'getprivilidgestype',true);
});
//add privilidgetype
router.delete('/PrivilidgeType/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    privilidgetype.deletePrivilidgeType(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteprivilidgestype',true);
});

module.exports = router;
