var md5 = require('md5');
var url = require('url');
var querystring = require('querystring');
var axios = require('axios');
var allPrivilidge = require('../../controller/allprivilidgeCrl');
var admin = require('../../controller/admin/admin');
var options = require('../../controller/optionsCrl');
var monthtransaction = require('../../controller/monthtransactionCrl');

//site url
exports.siteurl = function(req,res){ return 'https://mygymin.herokuapp.com/' ;}
//get base url
exports.baseurl = function(req,res){ return 'https://mygymin.herokuapp.com/api/v1/' ;}
//check authentication
exports.Auth = function(req,res,callback,privilidge,token=true){
  if(token) req.ability.throwUnlessCan('read', 'User');
  var callback2 =  function(havepermission){
    if(havepermission){
      // var pub_key = req.query.public_key;
      // var time = req.query.timestamp;
      // var signature = req.query.signature;
      // var createSignature = md5(md5('gyminAppwsds548_$%#@'+time+'@#!$$#@#$844%^^&(SDF%*%)'));
      // var currentDate = Math.round(new Date().getTime()/1000);
      //
      // if( signature === createSignature ){
      //   //console.log((time+30)+' '+currentDate);
      //   if((currentDate-time) < 30) callback();
      //   else res.status(401).send({auth:false,msg :'Bad request expired authentication.'});
      // }else res.status(401).send({auth:false,msg :'Bad request authentication faild.'});
     callback();
    }else {
        res.status(401);
        res.send('Sorry ! You Don\'t Have Permission To Access  This Page');
      }
    }
  //check permission
  checkprivilidge(req,res,privilidge,callback2);
}
//check users Privilidge
var checkprivilidge  = function(req,res,keyword,callback){
  if(keyword == 'login' || keyword=='register'|| keyword=='userbase' ||  keyword=='memberbase') callback(true);
  else {
 
    var handelprivilidge = function(privilidge,error){
      console.log('hii',Object.keys(privilidge).length)
      if(Object.keys(privilidge).length>0){
        var result = false;
        Object.keys(privilidge).forEach(function(key) {
          console.log('key & keyword',key,keyword)
          if (Object.values(privilidge[key]).indexOf(keyword) > -1) {
             result = true;
          }
        });
        callback(result);
      }else{
        var handeladminprivilidge = function(privilidge,error){
            if(privilidge[0] != undefined){
              privilidge = privilidge[0].privilidge.split(',');
              var result = false;
                if (Object.values(privilidge).indexOf(keyword) > -1) {
                   result = true;
                }
              callback(result);
            }else callback(false);
          }
        admin.getalladmins(req,res,handeladminprivilidge,{pub_key:req.query.public_key});
      }
    }
    allPrivilidge.getUsersPrivilidge(req,res,handelprivilidge,{parent_key:req.query.parent_key,key:req.query.public_key});
  }
}

//site url
exports.handelTransaction = function(req,res,pub_key,tranaction,total){
  var callback=function(result,error){
    if(result['calculate_transaction'] != undefined){
      var value = result['calculate_transaction'][tranaction];
      var fees = result['calculate_transaction']['fees'];

      var today = new Date();
      var month = today.getMonth()+1+'-'+today.getFullYear();
      var tranactioncallback = function(err,transactions){
        if(transactions[0] != undefined)
          var oldtranaction = transactions[0]['transactions'];
        else var oldtranaction = new Array();
        oldtranaction.push({tranaction,value,fees,total,'date':new Date(),'auhtor':req['query']['public_key']});
        var data = {transactions : JSON.stringify(oldtranaction),account_key : pub_key,month}
        var addtranactioncallback = function(){}
        monthtransaction.addTransaction(req,res,{'account_key':pub_key,month},data,addtranactioncallback);
      }
      monthtransaction.getTransaction(req,res,{'account_key':pub_key,month},{},tranactioncallback);
    }
  }
  var where = {$or:[{"key" :"calculate_transaction","pub_key":"admin"},{"key" :"calculate_transaction","pub_key":pub_key}]};
  options.getOption(req,res,where,{},callback)
 }
