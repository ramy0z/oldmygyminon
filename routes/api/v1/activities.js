var express = require('express');
var router = express.Router();
var activities = require('../../../controller/activitiesCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add activities
router.post('/addActivity', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    activities.addActivity(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'addactivities',true);
});
//update activities
router.patch('/updateActivity/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    activities.updateActivity(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editactivities',true);
});
//get all activitiess
router.delete('/deleteActivity/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    activities.deleteActivity(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteactivities',true);
});
//get all user settings
router.get('/getActivity', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send( {result,data} );
      else res.send( {result,error:data} );
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {units_key:req.query.parent_key}
    ],$and:[{}]}
    if(req.query.search){
      var search= req.query.search.toString();
      where['$and'].push({$or:[
                {'title':{'$regex': search }},
                {'discriptions':{'$regex': search }},
                {'type':{'$regex': search }}
              ]});
    }
    if(req.query.branch_key){
      where['$and'].push({branch_key:req.query.branch_key});
    }

    if(req.query.units_key){
      where['$and'].push({units_key:req.query.units_key});
    }
    activities.getActivity(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getactivities',true);
});
//get activite by id
router.get('/getActivityById/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send({result,data} );
      else res.send( {result,error:data} );
    }
    activities.getActivity(req,res,{_id:req.params.id},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getactivities',true);
});



module.exports = router;
