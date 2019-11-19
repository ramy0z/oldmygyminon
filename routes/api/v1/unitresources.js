var express = require('express');
var router = express.Router();
var unitresoureces = require('../../../controller/unitresourceCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add unitresoureces
router.post('/addResource', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    unitresoureces.addResource(req,res,handelresult);
  }
  //addunitresoureces
  auth.Auth(req,res,exceresult,'addunitresoureces',true);
});
//update unitresoureces
router.patch('/updateResource/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    unitresoureces.updateResource(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editunitresoureces',true);
});
//get all unitresourecess
router.delete('/deleteResource/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    unitresoureces.deleteResource(req,res,{_id:req.params.id},handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteunitresoureces',true);
});
//get all user settings
router.get('/getResource', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:true,data:result} );
      else res.send( {result:false,data:[]} );
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {units_key:req.query.parent_key}
    ]}
    unitresoureces.getResource(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getunitresoureces',true);
});
//get all user settings
router.get('/getResourceById/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:true,data:result} );
      else res.send( {result:false,data:[]} );
    }
    unitresoureces.getResource(req,res,{_id:req.params.id},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getunitresoureces',true);
});



module.exports = router;
