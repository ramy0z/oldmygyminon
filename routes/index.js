var express = require('express');
var router = express.Router();
var auth = require('../models/auth/auth');
const baseurl = auth.baseurl();
const host = baseurl+'customers/';

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user) res.redirect('/admin');
  else{
      if(req.query.invitation === 'true') var invitation=true;else var invitation=false;
      res.render('login', { title: 'Login',invitation: invitation ,layout:false });
    }
});
//get Login page
router.get('/login', function(req, res, next) {
  if(req.session.user) res.redirect('/admin');
  else res.render('login', { title: 'Login' ,layout:false});
});
//login send data
router.post('/login', function(req, res, next) {
  var handleResponse = function(data){
    if(data.result){
      req.session.user = data.user;
      if(typeof req.session.user.lastloginaccount != 'undefined' && req.session.user.lastloginaccount != '')
        req.session.user.parent_key = data.user.lastloginaccount;
      else if(typeof data.user.acounts[0] != 'undefined')
        req.session.user.parent_key = data.user.acounts[0].key;

      if(data.user.type == 'branch' || data.user.type == 'units') req.session.user.parent_key = data.user.pub_key;

      res.send({status:true});
     }
    else res.send({status:false});
  }
  const params = {username:req.body.username,password:req.body.password};
  auth.axiospost(req,res,host+'login',params,handleResponse,'post',false);
});
//logout page
router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});
//register form
router.get('/register', function(req, res, next) {
  res.render('register', {layout:false,error:''});
});
// send registration data
router.post('/register',function(req, res, next){
  var handleResponse = function(data){
    if(data.result){
      res.send({ status: true ,error:''});
    }else res.send({ status: false ,error:data});
  }
  auth.axiospost(req,res,host+'register',req.body,handleResponse,'post',false);
});
// send registration data
router.get('/emailinvitationlink/:parent_key/:email/:timestamp/:signature',function(req, res, next){
  var handleResponse = function(data){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    if(data.result == -2) res.render('error', { message: data.message,error:{status:404},layout:false});
    if(data.result == -3) res.render('error', { message: data.message,error:{status:404},layout:false});
    else if (data.result == 0) res.render('error', { message: 'An Error : Please try Again',layout:false});
    else if (data.result == 1) res.redirect('/?invitation=true');
    else if (data.result == -1) res.redirect('/register?link='+fullUrl);
  }
  if(req.query.all) var all=req.query.all;else var all='';
  var link = host+'emailinvitationlink/'+req.params.parent_key+'/'+req.params.email+'/'+req.params.timestamp+'/'+req.params.signature+'/'+all;
  auth.axiosget(req,res,link,handleResponse);
});
module.exports = router;
