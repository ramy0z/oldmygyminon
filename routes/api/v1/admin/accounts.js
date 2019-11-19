var express = require('express');
var router = express.Router();
var account = require('../../../../controller/userCrl');
var privilidge = require('../../../../controller/admin/privilidgeType');
var accountprivilidge = require('../../../../controller/allprivilidgeCrl');
var auth = require('../../../../models/auth/auth')
var mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
// Add New Account
router.post('/add', function(req, res, next) {

  var exceresult = function (){
    var callback = function(obj){
        if(obj.err) res.send({result:false,error:obj.msg,field:obj.field});
        else{
          var handelresult = function(result,error){
            if(error) res.send({result:false,error:result,field:''});
            else{
              if(result){
                var setprivilidgecallback =function(){
                  res.send({result:true,error:'',field:''});
                }
                setDefalutPrivilidge(req,res,result['pub_key'],setprivilidgecallback);
              }else res.send({result:false ,error:'',field:''});
            }
          }
          req.body.type='account';
          account.createUser(req,res,handelresult);
        }
    }
    account.checkExistsMail(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all members
router.get('/getallaccounts', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    var where = {type:'account'}
    account.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all members
router.get('/getaccountBypublickkey/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    if(req.params.pub_key.length ==24 )
      var where = {type:'account',_id:ObjectId(req.params.pub_key)}
    else var where = {type:'account',pub_key:req.params.pub_key}
    account.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//update user data
router.patch('/updateAccountData/:pub_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(email){
      if(email.err) res.send({result:false,error:email.msg,field:email.field});
      else{
        var callback1 = function(obj){
            if(obj) res.send({result:true});
            else res.send({result:false});
        }
        account.updateUserData(req,res,callback1);
      }
    }
    account.checkExistsMail(req,res,callback,req.params.pub_key);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//delete user data
router.delete('/deleteAdminData/:id', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj.n) res.send({result:true});
      else res.send({result:false});
    }
    account.deleteUserData(req,res,{_id:req.params.id},callback);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

var setDefalutPrivilidge = function(req,res,pub_key,callback){
  var privilidgeCallback= function(priType){
    if(priType[0] != undefined){
      req.body.key=pub_key;
      var data={parent_key:pub_key,privilidge:priType[0].privilidge,key:pub_key,'type':priType[0]._id,admin_key:pub_key,status:true}
      accountprivilidge.addUsersPrivilidge(req,res,callback,data);
    }
  }
  privilidge.getPrivilidgeType(req,res,{default:true},privilidgeCallback);
}
module.exports = router;
