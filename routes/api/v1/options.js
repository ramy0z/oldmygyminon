var express = require('express');

var router = express.Router();
var option = require('../../../controller/optionsCrl');
var notification = require('../../../controller/notifications/notificationsCrl');
var auth = require('../../../models/auth/auth');
/* GET api listing. */
//add option
router.post('/addOption', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    option.updateOption(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);

});
//update option
router.post('/updateOption', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    option.updateOption(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'',true);
});
//get all options
router.post('/deleteOption', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    option.deleteOption(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'',true);
});
//get all user settings
router.get('/getAllSettings', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:result});
      else res.send({result:false});
    }
    var where = {pub_key:req.query.parent_key}
    option.getOption(req,res,where,{ key: 1, value: 1, _id: 0 },handelresult);
  }
  auth.Auth(req,res,exceresult,'updatesettings',true);
});
//Update all user settings
router.patch('/updatesettings', function(req, res, next) {
  var exceresult = function (){
    var getOptionCallback= function(setting,err){
      var i=1;var length = Object.keys(req.body).length;
      Object.keys(req.body).forEach(function(itemkey) {
        req.body.key = itemkey;
        if(typeof req.body[itemkey] === 'object') req.body.value =JSON.stringify(req.body[itemkey]);
        else  req.body.value = req.body[itemkey];

        var handelresult = function (){
          //handel Norification Sessting
          handelNotificationSetting(req,res,itemkey,setting);
        }

        option.updateOption(req,res,handelresult);
        if(length <= i ) res.send({result:true});
        i++;
      });
    }
    var where = {pub_key:req.query.parent_key}
    option.getOption(req,res,where,{ key: 1, value: 1, _id: 0 },getOptionCallback);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//handel Notification Setting
var handelNotificationSetting = function(req,res,key,setting){
  var topics = ['newSubscription','membership'];
  var topickey = key.replace('Roles','');
  if(topics.includes(topickey)){
    var topic = req.query.parent_key+'_'+topickey+'Notification';
    var roles_ids = req.body[key];
    var subscribecallback = function(){};
    if(req.body[topickey+'Notification'] && req.body[topickey+'SendStaff']){
      var diffrent = arr_diff(setting[topickey+'Roles'],roles_ids);
      if(diffrent.length > 0)
        notification.subscribeAndUnscribeToTopicByRoles(req,res,diffrent,topic,subscribecallback,false)

      notification.subscribeAndUnscribeToTopicByRoles(req,res,roles_ids,topic,subscribecallback)
    }else{
      notification.subscribeAndUnscribeToTopicByRoles(req,res,roles_ids,topic,subscribecallback,false)
    }
  }
}
//get the removed items between 2 arrays
var arr_diff = function(a1,a2){
    if(a1 == 'undefined' || a1 == null) a1 =[];
    if(a2 == 'undefined' || a2 == null) a1 =[];
    var diff =[];
    Object.values(a1).forEach(function(val) {
      if(! a2.includes(val))
        diff.push(val);
    });
    return diff;
}

module.exports = router;
