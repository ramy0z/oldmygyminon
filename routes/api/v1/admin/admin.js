var express = require('express');
var router = express.Router();
var admin = require('../../../../controller/admin/admin');
var auth = require('../../../../models/auth/auth')
//login
router.post('/login', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send({result:true,user:data});
      else res.send({result:false,user:{}});
    }
    admin.login(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'login',false);
});
//register
router.post('/add', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj.err) res.send({result:false,error:obj.msg,field:obj.field});
      else{
        var handelresult = function(result,error){
          if(error) res.send({result:false,error:result,field:''});
          else{
            if(result) res.send({result:true,error:'',field:''});
            else res.send({result:false ,error:'',field:''});
          }
        }
        admin.createUser(req,res,handelresult);
      }
  }
  admin.checkExistsMail(req,res,callback);
}
auth.Auth(req,res,exceresult,'register',false);
});

router.patch('/updateAdminData/:pub_key', function(req, res, next) {
  var exceresult = function (){
      var handelresult = function(result){
        res.send({result});
      }
      var callback = function(obj){
          if(obj.err) res.send({result:false,error:obj.msg,field:obj.field});
          else{
            var handelresult = function(result,error){
              if(error) res.send({result:false,error:result,field:''});
              else{
                if(result) res.send({result:true,error:'',field:''});
                else res.send({result:false ,error:'',field:''});
              }
            }
          admin.updateUserData(req,res,{pub_key:req.params.pub_key},req.body,handelresult);
        }
      }
    admin.checkExistsMail(req,res,callback,req.params.pub_key);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all users
router.get('/getalladmins', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    admin.getalladmins(req,res,handelresult,{type:{$ne:'xsa'}});
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//register
module.exports = router;
