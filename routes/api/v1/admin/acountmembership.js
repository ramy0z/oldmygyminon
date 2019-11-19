var express = require('express');
var router = express.Router();
var membershipCrl = require('../../../../controller/admin/selectMembershipCrl');
var auth = require('../../../../models/auth/auth');
/* GET api listing. */
//add membershipCrl
router.post('/add', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    membershipCrl.addPackage(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//update membershipCrl
router.patch('/update/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    membershipCrl.updatePackage(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//get membershipCrl
router.get('/get', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,result){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    membershipCrl.getPackage(req,res,{},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//get membershipCrl
router.get('/getById/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,result){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    membershipCrl.getPackage(req,res,{_id:req.params.id},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get membershipCrl
router.get('/getByAccount/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(err,result){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    membershipCrl.getPackage(req,res,{account_key:req.params.pub_key},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//add membershipCrl
router.delete('/delete/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    membershipCrl.deletePackage(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

module.exports = router;
