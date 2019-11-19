var express = require('express');
var router = express.Router();
var auth = require('../../../models/auth/auth');
var notifications = require('../../../controller/notifications/notificationsCrl');

router.post('/sendToDevice', function(req, res, next) {
  var exceresult = function(){
    var callback = function(message,response){
      res.send({msg:message,res:response})
    }
    notifications.sendToDevice(req,res,req.body.token,callback,req.body.data,req.body.title,req.body.body,req.body.link,req.body.icon)
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

router.post('/sendToTopic', function(req, res, next) {
  var exceresult = function(){
    var callback = function(message,response){
      res.send({msg:message,res:response})
    }
    notifications.sendToTopic(req,res,req.body.topic,callback,req.body.data,req.body.title,req.body.body,req.body.link,req.body.icon)
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

router.post('/subscribeToTopic', function(req, res, next) {
  var exceresult = function(){
    var callback = function(message,response){
      res.send({msg:message,res:response})
    }
    notifications.subscribeToTopic(req,res,req.body.user_key,req.body.token,req.body.topic,callback);
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

router.post('/subscribeToTopicByRoles', function(req, res, next) {
  var exceresult = function(){
    var callback = function(message,response){
      res.send({msg:message,res:response})
    }
    notifications.subscribeToTopicByRoles(req,res,req.body.roles_ids,req.body.topic,callback);
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

router.post('/unsubscribeFromTopic', function(req, res, next) {
  var exceresult = function(){
    var callback = function(message,response){
      res.send({msg:message,res:response})
    }
    notifications.unsubscribeFromTopic(req,res,req.body.user_key,req.body.token,req.body.topic,callback);
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});


router.get('/getNotificationByUser/:user_key', function(req, res, next) {
  var exceresult = function(){
    var callback = function(data,err){
      if(err) res.send({result:true,err,data:[]})
      else res.send({result:true,data,err:''})
    }
    notifications.getNotification(req,res,{user_key: {$regex: ".*" + req.params.user_key + ".*"}},{},callback);
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

module.exports = router;
