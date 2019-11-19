var express = require('express');
var router = express.Router();
var timeschedual = require('../../../controller/timeschedualCrl');
var membership = require('../../../controller/membershipCrl');
var auth = require('../../../models/auth/auth');
var ObjectId = require('mongodb').ObjectID;

/* GET api listing. */
//add timeschedual
router.post('/addtimeschedual', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    timeschedual.addtimeschedual(req,res,handelresult);
  }
  //addtimeschedual
  auth.Auth(req,res,exceresult,'userbase',true);
});
//update timeschedual
router.patch('/updatetimeschedual/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    timeschedual.updatetimeschedual(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'edittimeschedual',true);
});
//get all timescheduals
router.delete('/deletetimeschedual/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    timeschedual.deletetimeschedual(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deletetimeschedual',true);
});
//get all user settings
router.get('/gettimeschedual', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:result} );
      else res.send( {result:false} );
    }
    if(req.body.shif_id) var where = {_id:req.body.shif_id}
    else var where = { $or:[{branch_key:req.query.parent_key},{club_key:req.query.parent_key},{units_key:req.query.parent_key}
    ]}
    timeschedual.gettimeschedual(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all schedual
router.post('/getschedual', function(req, res, next) {
  var exceresult = function (){
    var packageCallback = function (result,package){
      if(package[0] != undefined){
        var handelresult = function(data,err){
          if(! err) res.send( {result:true,data} );
          else res.send( {result:false,error:''} );
        }
        timeschedual.getSchedual(req,res,package[0].month_count,package[0].month_system,package[0].session_time,handelresult);
      }else res.send( {result:false,error:'package invalid'} );
    }
    var id = ObjectId(req.body.package);
    membership.getPackages(req,res,{$or:[{_id:id},{'membershipandpayments._id':id}]},{},packageCallback);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});



module.exports = router;
