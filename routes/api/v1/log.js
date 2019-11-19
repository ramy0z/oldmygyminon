var express = require('express');
var router = express.Router();
var auth = require('../../../models/auth/auth');
var log = require('../../../controller/logCrl');
var workouts = require('../../../controller/workoutsCrl');
var baseModel = require('../../../models/baseModel');

/* GET api listing. */
//add option
router.post('/add/', function(req, res, next) {
  //log.add(req, res,'action','table','log_state','ref_id','pref_id')
  // var data=[
  //   {club : "01a3a4e66c98b32e",name :"New subscribe" ,trans_key_state: "new_subscribe",weight : "250", calc: 0},
  //   {club : "01a3a4e66c98b32e",name :"New Membership sold" ,trans_key_state: "new_membership_sold",weight : "1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"RENew Membership sold" ,trans_key_state: "renew_membership",weight : "1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"Mebership upgrade" ,trans_key_state: "upgrade_membership",weight : "1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"Membership Downgrade" ,trans_key_state: "downgrade_membership",weight : "1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"Membership cancel" ,trans_key_state: "cancel_membership",weight : "-1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"PT Attendance Schedule" ,trans_key_state: "PT_attendance_schedule",weight : "1000", calc: 0},
  //   {club : "01a3a4e66c98b32e",name :"PT Attendance reSchedule" ,trans_key_state: "PT_attendance_reschedule",weight : "1000", calc: 0},
  //   {club : "01a3a4e66c98b32e",name :"PT Attendance Cancel" ,trans_key_state: "PT_attendance_cancel",weight : "-1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"PT Attendance Schedule Refund" ,trans_key_state: "PT_attendance_schedule_refund",weight : "-1", calc: 1},
  //   {club : "01a3a4e66c98b32e",name :"Membership Refund" ,trans_key_state: "membership_refunde",weight : "-1", calc: 1},

  // ];

  // baseModel.addmany(req, res, transaction_weight_model,data, function(result){
  //   console.log("result", result );
  // }, true);

  auth.Auth(req,res,function(){
    //res.send('connection done ya ebrahim :-)');
    
    // workouts.addworkouts(req, res ,function(result){
    workouts.giveAttendanceWorkouts(req, res ,function(result){
      
    //log.addMonthClubsBilling(req, res ,function(result){
    
    res.send(result);
    });
  },'userbase',true);
});

router.get('/get', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,data){
      if(! err) res.send({result:true,data});
      else res.send({result:false,data:[]});
    }
    log.getLogs(req,res,{},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

router.get('/getByClientkey/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,data){
      if(! err) res.send({result:true,data});
      else res.send({result:false,data:[]});
    }
    log.getLogs(req,res,{author:req.params.pub_key},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

router.get('/getAccount/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,data){
      if(! err) res.send({result:true,data});
      else res.send({result:false,data:[]});
    }
    var where = {$or:[{
          club:req.params.pub_key,
          branch:req.params.pub_key,
          units:req.params.pub_key
        }]}
    log.getLogs(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

module.exports = router;
