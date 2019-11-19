var baseModel = require('../../models/baseModel');
var notifications = require('../../models/notification/notifications');
var topics = require('./topicsCrl');
const firebase = require("firebase-admin");
var firebaseConfig = require("./secret.json");
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var users = require('../userCrl');
var optionsCrl = require('../optionsCrl');

//initialize firebase
firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
  databaseURL: "https://gymin-53ac3.firebaseio.com/"
});

//data send in notification
var payload = {

  notification: {
    "title": "Hello World",
    "body": "This is Message from Admin",
    "click_action":"http://localhost:4200/default/dashboard",
    "icon":"https://placeimg.com/250/250/people"
  },
  data:{}
};

//option of firebase notification
const options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24, // 1 day
};

/**** send notification to device use one or more token **/
exports.sendToDevice = function(req,res,usersIds,callback,data='',title='',body='',link='',icon=''){
  if(data  !='' && isJson(data)) payload['data']=JSON.parse(data);
  if(title !='') payload['notification']['title']=title;
  if(body  !='') payload['notification']['body']=body;
  if(link  !='') payload['notification']['click_action']=link;
  if(icon  !='') payload['notification']['icon']=icon;
  payload['data']['title'] = title;
  payload['data']['body'] = body;
  payload['data']['link'] = link;
  payload['data']['icon'] = icon;

  var addcallback = function(tokens,err){
    if(!err){
      firebase.messaging().sendToDevice(tokens, payload, options).then(function(response) {
        if(err) callback({result:false,err,msg:''})
        else callback({result:true,msg:"Successfully sent message",err:''})
      }).catch(function(error) {
         callback("Error sending message:", error);
      });
    }else callback({result:false,err:'no users',msg:''});
  };
  addnotificationfromRegisterToken(req,res,usersIds,JSON.stringify(payload['data']),addcallback);
}
/**** end send notification to device **/

/**** Subscription For Firebase Topic Using Device Token **/
exports.subscribeToTopic = function(req,res,user_key,token,topic,callback){
  console.log(token, topic);
  firebase.messaging().subscribeToTopic(token, topic)
    .then(function(response) {
      var addcallback = function(){
        callback("Successfully subscribed to topic:", response);
      }
      topics.add(req,res,user_key,topic,token,addcallback);
    })
    .catch(function(error) {
      callback("Error subscribing to topic:", error);
    });
}
/**** end Subscription For Firebase **/

/**** Subscription For Firebase Topic By Roles Using Device Token **/
exports.subscribeAndUnscribeToTopicByRoles = function(req,res,roles_ids,topic,callback,subOrunSub=true){
  var getUserCallback = function(users){
    var tokenCallback= function(result,err){
      var allTokens = new Array()
      var allusers = new Array()
      Object.values(result).forEach(function(item) {
        if(! allTokens.includes(item['token'])){
          allTokens.push(item['token']);
          allusers.push({token:item['token'],user_key:item['user_key']})
        }
      });

      if(allTokens.length > 0 ){
        if(subOrunSub) {
          firebase.messaging().subscribeToTopic(allTokens, topic)
          .then(function(response) {
            var addcallback = function(){}
            Object.values(allusers).forEach(function(user) {
              topics.add(req,res,user['user_key'],topic,user['token'],addcallback);
            });
            callback("Successfully subscribed to topic:", response);
          })
          .catch(function(error) {callback("Error subscribing to topic:", error);});
        }else{
          firebase.messaging().unsubscribeFromTopic(allTokens, topic)
          .then(function(response) {
            var addcallback = function(){}
            Object.values(allusers).forEach(function(user) {
              topics.delete(req,res,user['user_key'],topic,user['token'],addcallback);
            });
            callback("Successfully subscribed to topic:", response);
          })
          .catch(function(error) {callback("Error subscribing to topic:", error);});
        }
      }else callback("No Tokens", '');
    }
    users.push(req.query.public_key);
    topics.get(req,res,{user_key:{$in:users},topic:'allUsers'},tokenCallback)
  }
  users.GetUserByPrivlidgeTypeId(req ,res,roles_ids,getUserCallback);
}
/**** end Subscription For Firebase By Roles **/

/**** Subscription For Firebase Topic By Roles Using Device Token **/
exports.subscribeAndUnscribeToTopicByRolesAndUserID = function(req,res,roles_ids,user_key,callback,subOrunSub=true){
  var tokenCallback= function(result,err){

    if(result[0] != undefined){
        var getOptionCallback= function(options,err){
          Object.keys(options).forEach(function (option) {

            var topic = option.replace('Roles','Notification');
            topic = req.query.parent_key+'_'+topic;

            var addcallback = function(){}

            if(subOrunSub) {
              firebase.messaging().subscribeToTopic(result[0]['token'], topic)
              .then(function(response) {
                topics.add(req,res,user_key,topic,result[0]['token'],addcallback);
                callback("Successfully subscribed to topic:", response);
              })
              .catch(function(error) {callback("Error subscribing to topic:", error);});
            }else{
              firebase.messaging().unsubscribeFromTopic(result[0]['token'], topic)
              .then(function(response) {

                topics.delete(req,res,user_key,topic,result[0]['token'],addcallback);
                callback("Successfully subscribed to topic:", response);
              })
              .catch(function(error) {callback("Error subscribing to topic:", error);});
            }
          });
        }
      var where = {pub_key:req.query.parent_key,value:{$regex: ".*" + roles_ids + ".*"}}
      optionsCrl.getOption(req,res,where,{ key: 1, value: 1, _id: 0 },getOptionCallback)
    }else callback("No Tokens", '');
  }
  topics.get(req,res,{user_key,topic:'allUsers'},tokenCallback)
}
/**** end Subscription For Firebase By Roles **/

/**** UnSubscription For Firebase Topic Using Device Token **/
exports.unsubscribeFromTopic = function(req,res,user_key,token,topic,callback){
  firebase.messaging().unsubscribeFromTopic(token, topic)
    .then(function(response) {
      var addcallback = function(){
        callback("Successfully unsubscribed to topic:", response);
      }
      topics.delete(req,res,user_key,topic,token,addcallback);
    })
    .catch(function(error) {
      callback("Error subscribing to topic:", error);
    });
}
/**** end UnSubscription For Firebase **/

/**** send notification to All device By Using Firbase Topic **/
exports.sendToTopic = function(req,res,topic,callback,data='',title='',body='',link='',icon=''){
  if(data  !='' && isJson(data)) payload['data']=JSON.parse(data);
  if(title !='') payload['notification']['title']=title;
  if(body  !='') payload['notification']['body']=body;
  if(link  !='') payload['notification']['click_action']=link;
  if(icon  !='') payload['notification']['icon']=icon;
  payload['data']['title'] = title;
  payload['data']['body'] = body;
  payload['data']['link'] = link;
  payload['data']['icon'] = icon;
  payload['data']['topic'] = topic;


  firebase.messaging().sendToTopic(topic, payload)
    .then(function(response) {
      var addcallback = function(result,err){
        if(err) callback({result:false,err,msg:''})
        else callback({result:true,msg:"Successfully sent message: "+topic,err:''})
      };
      addnotificationfromtobic(req,res,topic,JSON.stringify(payload['data']),addcallback)
    })
    .catch(function(error) {
      callback("Error sending message:", error);
    });
}
// add notification
var addnotificationfromtobic = function(req,res,topic,data,callback){
  var getusertopicscallback = function(result,err){
    var save_data = {club_key:'',branch_key:'',units_key:req.query.parent_key,user_key,author_key:req.query.public_key,data}
    var user_key= new Array();
    Object.values(result).forEach(async function (obj) {
      user_key.push(obj['user_key'])
    });
    save_data['user_key'] = JSON.stringify(user_key);
    baseModel.add(req,res,notifications, save_data, callback);
  }
  topics.get(req,res,{topic},getusertopicscallback);
}
/**** end send notification to Topic **/
// add notification
var addnotificationfromRegisterToken = function(req,res,ids,data,callback){
  var getusertopicscallback = function(result,err){
    var save_data = {club_key:'',branch_key:'',units_key:req.query.parent_key,user_key,author_key:req.query.public_key,data}
    var user_key= new Array();var tokens= new Array();
    Object.values(result).forEach(async function (obj) {
      user_key.push(obj['user_key']);
      tokens.push(obj['token']);
    });
    if(tokens.length > 0){
      var addcallback=function(){callback(tokens,false)}
      save_data['user_key'] = JSON.stringify(user_key);
      baseModel.add(req,res,notifications, save_data, addcallback);
    }else callback(tokens,true);
  }
  topics.get(req,res,{user_key:{$in:ids},topic:'allUsers'},getusertopicscallback);
}
/**** end send notification to Topic **/
exports.getNotification = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    var data={
    title : '',
    body : '',
    link : '',
    icon: '',
    data:{}
  }
  var result = new Array();
  var i=1;
    Object.keys(obj).forEach(function(key) {
      var package = obj[key];
        var onepackges = new Object(); onepackges['increment']=i;i++;
      Object.keys(data).forEach(function(index) {

        if(package[index] != undefined) onepackges[index]=package[index];
        else onepackges[index]=data[index];
      });
      if(isJson(onepackges.data)) onepackges.data = JSON.parse(onepackges.data);
      else onepackges.data = {};
      result.push(onepackges);
    });
     callback(result,error);
  }
  baseModel.get(req,res,notifications,where,select,callback1,true);
}
//check if string is valid json
function isJson(str) {
  try {JSON.parse(str);}
  catch (e) {return false;}
  return true;
}
