var express = require('express');
var router = express.Router();
var privilidgetype = require('../../../controller/allprivilidgeCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add privilidgetype
router.post('/UsersPrivilidge', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      console.log(result)
      if(! err) 
      {
        if(result)
        res.send({result:true,data:result})
        else
        res.send({result:false,data:{}})

      }
      else res.send({result:false});
    }
    privilidgetype.addUsersPrivilidge(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'addprivilidges',true);
});
//update privilidgetype
router.patch('/UsersPrivilidge/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    privilidgetype.updateUsersPrivilidge(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editprivilidges',true);
});
//get privilidgetype
router.post('/getUsersPrivilidge', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    privilidgetype.getUsersPrivilidge(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'getprivilidges',true);
});
//get All User Which Have Privilidge
router.get('/getAllUsersPrivilidge', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    privilidgetype.getAllUsersPrivilidges(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'getprivilidges',true);
});
//Delete Users Privilidges
router.delete('/UsersPrivilidge/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    privilidgetype.deleteUsersPrivilidge(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deleteprivilidges',true);
});

module.exports = router;
