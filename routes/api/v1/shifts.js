var express = require('express');
var router = express.Router();
var shifts = require('../../../controller/shiftsCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add shifts
router.post('/addShift', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    shifts.addShift(req,res,handelresult);
  }
  //addshifts
  auth.Auth(req,res,exceresult,'addshifts',true);
});
//update shifts
router.patch('/updateShift/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    shifts.updateShift(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editshifts',true);
});
//get all shiftss
router.delete('/deleteShift/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    shifts.deleteShift(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteshifts',true);
});

//get all user settings
router.get('/getShifts', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:true,data:result} );
      else res.send( {result:false,data:[]} );
    }
    if(req.body.shif_id) var where = {_id:req.body.shif_id}
    else var where = { $or:[{branch_key:req.query.parent_key},{club_key:req.query.parent_key},{units_key:req.query.parent_key}
    ]}
    shifts.getShift(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getshifts',true);
});

//get all user settings
router.get('/getShifts/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send( {result:true,data:result} );
      else res.send( {result:false,data:[]} );
    }
 var where = { $or:[{branch_key:req.query.parent_key},{club_key:req.query.parent_key},{units_key:req.query.parent_key}
 ],user_key:req.params.pub_key,$and:[{}]}
 if(req.query.search){
   var search= req.query.search.toString();
   where['$and'].push({$or:[
             {'day_per_week':{'$regex': search }},
             {'shift_type':{'$regex': search }}
           ]});
 }
    shifts.getShift(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getshifts',true);
});





module.exports = router;
