var express = require('express');
var router = express.Router();
var user = require('../../../controller/userCrl');
var unitresource = require('../../../controller/unitresourceCrl');
var allPrivilidge = require('../../../controller/allprivilidgeCrl');
var auth = require('../../../models/auth/auth')
var mongoose=require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
//get all users
router.get('/getallusers', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
   var where = { type: { $ne: 'xsa' },$and:[{}]};

    user.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//get user by id
router.get('/getuserbyid/:id', function(req, res, next) {
  var exceresult = function (){
    console.log(req.params.id)
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
   var where = { type: { $ne: 'xsa' },$and:[]};
   if(req.params.id.length == 24) where['$and'].push({_id:ObjectId(req.params.id)});
   else where['$and'].push({pub_key:req.params.id});
    user.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//get all users
router.get('/getallstaff', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {pub_key:{ $nin: [req.query.parent_key,req.query.public_key]},'usermetas.value':req.query.parent_key,'usermetas.key':'parent_key'}
    ],$and:[{'usermetas.value':'staff','usermetas.key':'user_type'}]}
    user.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//get all member
router.get('/getallmembers', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {pub_key:{ $nin: [req.query.parent_key,req.query.public_key]},'usermetas.value':'0c2c35442ef5d6bb','usermetas.key':'parent_key'}
    ],$and:[{'usermetas.value':'member','usermetas.key':'user_type'}]}
    user.getallmembers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});

router.get('/getmembersbybranch', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {pub_key:{ $nin: [req.query.parent_key,req.query.public_key]},'usermetas.value':req.query.parent_key,'usermetas.key':'parent_key'}
    ],$and:[{'usermetas.value':'member','usermetas.key':'user_type'}]}
    user.getUserBybranch(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});




router.get('/getmember/:id', function(req, res, next) {
  console.log(req.params.id)
  if(req.params.id !='undefined')
  {
  var exceresult = function (){

    var handelresult = function(result){
      console.log(result)
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    user.getallmembers(req,res,handelresult,{pub_key:req.params.id});

  }
  auth.Auth(req,res,exceresult,'getallusers',true);
}
else
{
  res.send({'result':false})
}
});

//get all members
router.get('/getallmembers', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length) res.send({result:true,users:result});
      else res.send({result:false,users:result});
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {pub_key:{ $nin: [req.query.parent_key,req.query.public_key]},'usermetas.value':req.query.parent_key,'usermetas.key':'parent_key'}
    ],$and:[{'usermetas.value':'member','usermetas.key':'user_type'}]}
    user.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//Get Club Branch And Units
router.get('/getAllBranchAndUnits', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length){
        var response = new Array();
        Object.keys(result).forEach(function(key) {
          response[key] = {_id:result[key]._id,pub_key:result[key].pub_key,branch_key :result[key].branch_key ,name:result[key].name,type:result[key].type}
        });
        res.send({result:true,data:response});
      }
      else res.send({result:false,data:result});
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
    ]}
    user.getallusers(req,res,handelresult,where);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
})
//Get Club Branch And Units
router.get('/getClubTree', function(req, res, next) {
  
  var exceresult = function (){
    var handelresult = function(result){
      if(result.length)
        res.send({result:true,data:result});
      else
        res.send({result:false,data:result});
    }
    user.getClubTree(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//login
router.post('/login', function(req, res, next) {
console.log('data',req.body.username,req.body.email)

  var exceresult = function (){
    var handelresult = function(result,data){
      if(result){
        var handelprivilidge = function(privilidge,error){
         // data.allPrivilidge = privilidge;
          res.send({result:true,user:data});
        }
        if(typeof data.lastloginaccount != 'undefined' && data.lastloginaccount != '')
          req.query.parent_key = data.lastloginaccount;
        else if(typeof data.acounts[0] != 'undefined')
          req.query.parent_key = data.acounts[0].key;

        if(data.type == 'branch' || data.type == 'units') req.query.parent_key = data.pub_key;
        req.query.public_key = data.pub_key;
        allPrivilidge.getUsersPrivilidge(req,res,handelprivilidge);
      }else res.send({result:false,user:{}});
    }
    user.login(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'login',false);
});
//register
router.post('/register', function(req, res, next) {
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
        user.createUser(req,res,handelresult);
      }
  }
  user.checkExistsMail(req,res,callback);
}
auth.Auth(req,res,exceresult,'register',false);
});
//get user data
router.get('/getUserData', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj.length) res.send({result:true,user:obj});
      else res.send({result:false,usre:{}});
    }
    user.getUserData(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);//getallusers
});
//update user data
router.patch('/updateUserData/:pub_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(email){
      if(email.err) res.send({result:false,error:email.msg,field:email.field});
      else{
        var callback1 = function(obj){
            if(obj) res.send({result:true});
            else res.send({result:false});
        }
        user.updateUserData(req,res,callback1);
      }
    }
    user.checkExistsMail(req,res,callback,req.params.pub_key);
  }
  auth.Auth(req,res,exceresult,'updateuserdata',true);
});
//delete user data
router.delete('/deleteUserData/:id', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj.n) res.send({result:true});
      else res.send({result:false});
    }
    user.deleteUserData(req,res,{_id:req.params.id},callback);
  }
  auth.Auth(req,res,exceresult,'deleteuserdata',true);
});
//delete user data
router.post('/upgradetoclub', function(req, res, next) {
  var exceresult = function (){
    var callback = function(obj){
        if(typeof obj[0] != 'undefined') res.send({result:true});
        else res.send({result:false});
    }
      user.upgradetoclub(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'createuser',true);
});
//Subscribe Club
router.get('/subscribetoclub/:id', function(req, res, next) {
  var exceresult = function (){
    var callback = function(obj,message){
        if(obj) res.send({result:true,message:message});
        else res.send({result:false,message:message});
    }
      user.subscribetoclub(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'createuser',true);
});
//UnSubscribe Club
router.delete('/unsubscribetoclub/:id', function(req, res, next) {
  var exceresult = function (){
    var callback = function(obj){
      var callback1 = function(obj1){
          if(obj.n) res.send({result:true});
          else res.send({result:false});
        }
        var where = {key:req.params.id,parent_key:req.query.parent_key}
        allPrivilidge.deleteUsersPrivilidgeByPubkey(req,res,where,callback1)
    }
      user.unsubscribetoclub(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'deleteuserdata',true);
});

//UnSubscribe Club
router.patch('/activeAndDeactiveUser', function(req, res, next) {
  var exceresult = function (){
    var callback = function(obj){
      // var callback1 = function(obj1){
          if(obj.n) res.send({result:true});
          else res.send({result:false});
        // }
        // var where = {key:req.params.id,parent_key:req.query.parent_key}
        // allPrivilidge.deleteUsersPrivilidgeByPubkey(req,res,where,callback1)
    }
      user.activeAndDeactiveUser(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'deleteuserdata',true);
});
//change user account
router.get('/changeaccount/:id', function(req, res, next) {
  req.query.parent_key = req.params.id;
  var exceresult = function (){
  var callback1 = function(result){
    var callback2 = function(result,err){
      if(! err) res.send({result:true,allPrivilidge:result});
      else res.send({result:false,allPrivilidge:{}});
      }
      allPrivilidge.getUsersPrivilidge(req,res,callback2);
    }

    user.updateusermeta(req,res,'lastloginaccount',req.params.id,callback1);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
/**
*
*

brance and units
*/

//Add Branch
router.post('/addBranch', function(req, res, next) {
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
        req.body.type='branch';
        user.createUser(req,res,handelresult);
      }
    }
    user.checkExistsMail(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'createuser',true);
});
//Add Units
router.post('/addUnits', function(req, res, next) {
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
        req.body.type='units';
        req.body.user_type='staff';

        user.createUser(req,res,handelresult);
      }
    }
    user.checkExistsMail(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'createuser',true);
});

//get Branch data
router.get('/getBranchData/:branch_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj) res.send({result:true,user:obj});
      else res.send({result:false,user:{}});
    }
    user.getBranchData(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//get Units Data
router.get('/getUnitsData/:units_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj) res.send({result:true,user:obj});
      else res.send({result:false,user:{}});
    }
    user.getUnitsData(req,res,callback);
  }
  auth.Auth(req,res,exceresult,'getallusers',true);
});
//update Branch data
router.patch('/updateBranchData/:pub_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(email){
      if(email.err) res.send({result:false,error:email.msg,field:email.field});
      else{
        var callback1 = function(obj){
            if(obj) res.send({result:true});
            else res.send({result:false});
        }
        user.updateUserData(req,res,callback1);
      }
    }

    if(req.body.email) user.checkExistsMail(req,res,callback,req.params.pub_key);
    else callback({});
  }
  auth.Auth(req,res,exceresult,'updateuserdata',true);
});
//update Units data
router.patch('/updateUnitsData/:pub_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(email){
      if(email.err) res.send({result:false,error:email.msg,field:email.field});
      else{
        var callback1 = function(obj){
            if(obj) res.send({result:true});
            else res.send({result:false});
        }
        user.updateUserData(req,res,callback1);
      }
    }

    if(req.body.email) user.checkExistsMail(req,res,callback,req.params.pub_key);
    else callback({});
  }
  auth.Auth(req,res,exceresult,'updateuserdata',true);
});
//delete Branch
router.delete('/deleteBranch/:pub_key', function(req, res, next) {
  var exceresult = function (){
  var callback = function(obj){
      if(obj.n){
        var deleteResourceCallback = function(){};
        unitresource.deleteResource(req,res,{branch_key:req.params.pub_key},deleteResourceCallback);
        res.send({result:true});
      } else res.send({result:false});
    }
    user.deleteUserData(req,res,{$or:[{pub_key:req.params.pub_key},{branch_key:req.params.pub_key}]},callback);
  }
  auth.Auth(req,res,exceresult,'deleteuserdata',true);
});
//delete Units
router.delete('/deleteUnits/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var callback = function(obj){
      if(obj.n){
        var deleteResourceCallback = function(){};
        unitresource.deleteResource(req,res,{units_key:req.params.pub_key},deleteResourceCallback);
        res.send({result:true});
      } else res.send({result:false});
    }
    user.deleteUserData(req,res,{$or:[{pub_key:req.params.pub_key},{units_key:req.params.pub_key}]},callback);
  }
  auth.Auth(req,res,exceresult,'deleteuserdata',true);
});
/**
*
*end brance and units
*/
//Invite User To Club
router.post('/invitation', function(req, res, next) {
  var exceresult = function (){
  var callback1 = function(result){
      if(result === 'userexists') res.send({result:-2,message:'This Email Already In Your Club'});
      else if(result === 'email send before') res.send({result:-1,message:'You Send This Email Befor'});
      else if (result === 'error') res.send({result:0,message:'Authentication Error'});
      else res.send({result:1,message:'Invitation Send Successfully'});
    }
    user.inviteToClub(req,res,callback1);
  }
  auth.Auth(req,res,exceresult,'sendinvitations',true);
});
//Invite User To Club
router.get('/resendinvitation/:id', function(req, res, next) {
  var exceresult = function (){
  var callback1 = function(result){
      if (result === 'error') res.send({result:0,message:'Authentication Error'});
      else res.send({result:1,message:'Invitation Send Successfully'});
    }
    user.resendInviteToClub(req,res,callback1);
  }
  auth.Auth(req,res,exceresult,'sendinvitations',true);
});
//Invite User To Club
router.get('/revokeinvitation/:id', function(req, res, next) {
  var exceresult = function (){
  var callback1 = function(result){
      if (result === 'error') res.send({result:0,message:'Authentication Error'});
      else res.send({result:1,message:'Revoke Done Successfully'});
    }
    user.revokeInviteToClub(req,res,callback1);
  }
  auth.Auth(req,res,exceresult,'sendinvitations',true);
});
//check User Email Invitations
router.get('/emailinvitationlink/:parent_key/:email/:timestamp/:signature/:user_type/:all', function(req, res, next) {
  var exceresult = function (){
  var callback1 = function(result){
      if(result === 'linkexpired' ) res.send({result:-2,message:"Link Expired"});
      else if(result === 'emailNotExists' ) res.send({result:-1,message:"Invalid Email"});
      else if(result === 'invite error' ) res.send({result:0 ,message:"Invitation Error"});
      else if(result === 'addbefore' ) res.send({result:-3 ,message:"You are used this link before"});
      else res.send({result:1,message:"Invitation Done"});
    }
    user.checkInvitationLink(req,res,callback1);
  }
  auth.Auth(req,res,exceresult,'userbase',false);
});
module.exports = router;
