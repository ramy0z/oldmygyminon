var express = require('express');
var router = express.Router();
var userCrl = require('../../../../controller/userCrl')
var emailCrl = require('../../../../controller/emailCrl')
var auth = require('../../../../models/auth/auth');
router.post('/register', function (req, res) {
  var exceresult = function () {
    req.body.type = 'member'
    var callback = function (result) {
      console.log(result)
     res.send(result)
    }
    userCrl.registerMember(req, res, callback)
  }
  auth.Auth(req, res, exceresult, 'register', false);
})

router.post('/login', function (req, res) {
//console.log('data',req.body.username,req.body.email)

  var msg=""
  if(req.body.username&&req.body.email) msg=msg+'Email , Username or Password are invalid'
 else if(req.body.username) msg=msg+'Username or Password are invalid'
 else if(req.body.email) msg=msg+'E-mail or Password are invalid'
 else {
   msg='Forbidden request'
 }
  
  var exceresult = function () {
    var callback = function (result, data) {
      if (result)
       { res.setHeader('page','1');
        res.send({ 'result': true, 'data': data })}
      else
       { res.setHeader('page','1');
        res.send({ 'result': false, 'data': msg })
    }
    }
    userCrl.login(req, res, callback)
  }
  auth.Auth(req, res, exceresult, 'login', false);
})

router.get('/getMemberData/:pub_key', function (req, res) {
  var exceresult = function () {
    var callback1 = function (result) {
      if (result.length) {
        res.setHeader('page','1');
        res.send({ 'result': true, 'data': result })
      }
      else {
        res.setHeader('page','0');
        res.send({ 'result': true, 'data': []})
      }

    }
    userCrl.getallmembers(req, res, callback1, { 'pub_key': req.params.pub_key })
  }
  auth.Auth(req, res, exceresult, 'memberbase', true);
})

router.patch('/updateMemberData/:pub_key', function (req, res) {
  console.log(req.headers)
  var exceresult = function () {
    if (req.params.pub_key) {
      var callback1 = function (result) {
        res.setHeader('page','1');
        if(result.result)
        {
          result.data[0].token=req.headers.authorization
          result={result:true,data:result.data[0]}
        }
        res.send(result)
      }
      userCrl.updateMemberData(req, res, callback1, { 'pub_key': req.params.pub_key })
    }
    else {
      res.send({ 'result': false, 'data': 'Sorry,Data update failed. try again' })
    }
  }
  auth.Auth(req, res, exceresult, 'memberbase', true);
})

router.get('/verify', function (req, res) {
 
    emailCrl.checkConfirmMailcode(req,res,(result)=>{
      if(req.query.mdw=='1') res.write('<h1>hiiiiiiiiiiiii</h1><h3 style="color:red">hello</h3><p>confirm code:'+result.data+'</p>')
       else res.send(result)   
      
    })
  
 
})


router.get('/resendconfirm', function (req, res) {
 
    emailCrl.resendconfrmmailcode(req,res,(result)=>{
      res.send(result)
    })
  
 
})
module.exports = router