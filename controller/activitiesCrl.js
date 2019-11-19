var baseModel = require('../models/baseModel');
var activities = require('../models/activities/activities');
var auth = require('../models/auth/auth');
var log = require('./logCrl');

exports.addActivity = function(req,res,callback){
    var callback1 = function(obj,error){
      if(error) callback(obj,error);
      else callback(obj,false);
      //log.add(req, res,'addActivity','activites',obj[0]._id,'',obj[0]);
    }

    if(req.body.club_key==undefined) req.body.club_key=req.query.parent_key;
    if(req.body.branch_key==undefined && req.body.units_key==undefined){
      req.body.branch_key=req.query.parent_key;
      req.body.units_key=req.query.parent_key;
    }

    if(typeof req.body.schedual_time != 'string')
      var schedual_time = JSON.stringify(req.body.schedual_time);
    else var schedual_time = '[]';

    if(req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
    var data={
      club_key : req.body.club_key,
      branch_key : req.body.branch_key,
      units_key : req.body.units_key,
      title : req.body.title,
      // month_count : req.body.month_count,
      // month_system : req.body.month_system,
      fees : req.body.fees,
      taxs : req.body.taxs,
      payment_startegy : req.body.payment_startegy,
      type : req.body.type,
      discount : req.body.discount,
      start_discount : req.body.start_discount,
      end_discount : req.body.end_discount,
      image : req.body.image,
      discriptions : req.body.discriptions,
      session_time : req.body.session_time,
      //day_per_week : req.body.day_per_week,
      users_count : req.body.users_count,
      session_count : req.body.session_count,
      start_date : req.body.start_date,
      end_date : req.body.end_date,
      schedual_time : schedual_time,
      additional_visits : req.body.additional_visits,
      additional_invitation : req.body.additional_invitation,
      additional_service : req.body.additional_service,
      status : true
    }
    baseModel.add(req,res,activities,data,callback1,true);
}

exports.getActivity = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else{
      var data={
        _id : '',
        club_key : '',
        branch_key : '',
        units_key : '',
        title : '',
        // month_count : '',
        // month_system : '',
        fees : '',
        taxs : '',
        payment_startegy : '',
        type : '',
        discount : '',
        start_discount : '',
        end_discount : '',
        image : '',
        discriptions : '',
        session_time : '',
        //day_per_week : '',
        users_count : '',
        session_count : '',
        start_date : '',
        end_date : '',
        schedual_time : '',
        additional_visits : '',
        additional_invitation : '',
        additional_service : '',
        status : ''
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
        if(onepackges.image !='') onepackges.image = auth.siteurl()+onepackges.image;
        if(isJson(onepackges.schedual_time))
           onepackges.schedual_time = JSON.parse(onepackges.schedual_time);
        else onepackges.schedual_time=new Array();
        result.push(onepackges);
      });
      callback(true,result);
    }
  }
  baseModel.get(req,res,activities,where,select,callback1,true);
}

exports.updateActivity = function(req,res,callback){
  var callback1 = function(obj,error){
    if(obj.n) callback(true);
    else callback(false);
  }
  var getcallback = function(error,result){
    //log.add(req, res,'updateActivity','activites',req.params.id,result[0],req.body);
  }
  this.getActivity(req,res,{_id:req.params.id},{},getcallback)


  if(typeof req.body.schedual_time == 'object')
     req.body.schedual_time = JSON.stringify(req.body.schedual_time);
  else req.body.schedual_time=[];

  if(req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  baseModel.updateoradd(req,res,activities,{_id:req.params.id},req.body,callback1,true);
}

exports.deleteActivity = function(req,res,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  var getcallback = function(error,result){
    //log.add(req, res,'deleteActivity','activites',req.params.id,result[0],'');
  }
  this.getActivity(req,res,{_id:req.params.id},{},getcallback);

  baseModel.delete(req,res,activities,{_id:req.params.id},callback1,false,true);
}

//check if string is valid json
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
