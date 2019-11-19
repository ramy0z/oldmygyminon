var express = require('express');
var router = express.Router();
var attendance = require('../../../controller/attendanceCrl');
var membership = require('../../../controller/membershipCrl');
var auth = require('../../../models/auth/auth');
var ObjectId = require('mongodb').ObjectID;
var log =require('../../../controller/logCrl');

/* GET api listing. */
//add attendance
router.post('/addattendance', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    attendance.addattendance(req,res,handelresult);
  }

  auth.Auth(req,res,exceresult,'userbase',true);
});
//update attendance
router.patch('/updateattendance/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    attendance.updateattendance(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'updateattendance',true);
});
//get all attendances
router.delete('/deleteattendance/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    attendance.deleteattendance(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteattendance',true);
});
//get all user settings
router.get('/getattendance', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:result} );
      else res.send( {result:false} );
    }
    if(req.body.shif_id) var where = {_id:req.body.shif_id}
    else var where = { $or:[{branch_key:req.query.parent_key},{club_key:req.query.parent_key},{units_key:req.query.parent_key}
    ]}
    attendance.getattendance(req,res,where,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all schedual
router.post('/showTimesBeforeReschedual', function(req, res, next) {
  var exceresult = function (){
      var handelresult = function(result,data){
        if(result) res.send( {result,data:data} );
        else res.send( {result,error:data} );
      }
      attendance.showTimesBeforeReschedual(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all schedual
router.post('/handelAttendance', function(req, res, next) {
  var exceresult = function (){
    var packageCallback = function (result,package){
      if(package[0] != undefined){
        //check if user select all day per week
        if(req.body.reservation.length == package[0].day_per_week){
          var handelresult = function(result,data){
           // console.log('hhhh',result,data)
            if(data.length>0){
               // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
              var pref_id='';
              //console.log("fffffffffffffffffffffffffffffff",req.body.selectePackage_id);
              var ref_id=req.body.selectePackage_id;
              var trans_num = data.length;
              var ref_scadual_arr =data;
              var pref_scadual_arr=[];
              log.add(req, res,'handelAttendance','attendances', 'PT_attendance_schedule',ref_id,pref_id ,trans_num ,ref_scadual_arr ,pref_scadual_arr);
              res.send( {result:result} );
            } 
            else res.send( {result:false,error:result} );
          }
          attendance.handelAttendance(req,res,package[0].month_count,package[0].month_system,req.body.selectePackage_id,handelresult);
        }else res.send( {result:false,error:'Please Select '+package[0].day_per_week+' Days'} );
      }else res.send( {result:false,error:'package invalid'} );
    }
    var id = ObjectId(req.body.package);
    membership.getPackages(req,res,{$or:[{_id:id},{'membershipandpayments._id':id}]},{},packageCallback);
    }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//get all schedual
router.post('/viewAttendance', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(data,err){
      if(! err) res.send( {result:true,data,error:''} );
      else res.send( {result:false,data:[],error:data} );
    }

    var data = {
      membership_id : req.body.membership_id,
      user_key : req.body.user_key,
      trainer_key : req.body.trainer_key,
      status : req.body.status,
      club_key : req.body.club_key,
      units_key : req.body.units_key,
      branch_key : req.body.branch_key,
      day : req.body.day,
      or:[
        {branch_key:req.query.parent_key},
        {club_key:req.query.parent_key},
        {units_key:req.query.parent_key}
      ]
    }
    attendance.viewAttendance(req,res,data,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//reschedual attendance
router.post('/reschedualAttendance', function(req, res, next) {
  var exceresult = function (){
        var handelresult = function(result,error){
        if(result) res.send( {result,error:''} );
        else res.send( {result,error} );
      }
      attendance.reschedualAttendance(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//cancel attendance
router.post('/cancelAttendance', function(req, res, next) {
  var exceresult = function (){
        var handelresult = function(result,error){
        if(result) res.send( {result,error:''} );
        else res.send( {result,error} );
      }
      attendance.cancelAttendance(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//cancel attendance
router.post('/cancelAttendance', function(req, res, next) {
  var exceresult = function (){
        var handelresult = function(result,error){
        if(result) res.send( {result,error:''} );
        else res.send( {result,error} );
      }
      attendance.cancelAttendance(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

module.exports = router;
