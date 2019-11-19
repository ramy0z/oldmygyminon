var express = require('express');
var router = express.Router();
var email = require('../../../controller/emailCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add email
router.post('/addEmails', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    email.addEmail(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'',true);
});
//update email
router.post('/updateEmails', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    email.updateEmail(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'',true);
});
//get email
router.get('/getEmails', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    email.getEmail(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//add email
router.delete('/deleteEmails/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    email.deleteEmail(req,res,{_id:req.params.id},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get email
router.get('/getUsresWhichSendEmails', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    email.getUsresWhichSendEmails(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
module.exports = router;
