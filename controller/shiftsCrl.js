var baseModel = require('../models/baseModel');
var shifts = require('../models/shifts/shifts');
var timeschedual = require('./timeschedualCrl');

exports.addShift = function(req,res,callback){
      var callback1 = function(obj,error){
        if(error) callback(obj,error);
        else callback(obj,false);
      }
      if(req.body.club_key==undefined) req.body.club_key=req.query.parent_key;
      if(req.body.branch_key==undefined && req.body.units_key==undefined){
        req.body.branch_key=req.query.parent_key;
        req.body.units_key=req.query.parent_key;
      }
      if(req.body.from_time == undefined) req.body.from_time='';
      if(req.body.to_time == undefined) req.body.to_time='';
      var data={
        club_key : req.body.club_key,
        branch_key : req.body.branch_key,
        units_key : req.body.units_key,
        user_key : req.body.user_key,
        shift_type : req.body.shift_type,
        day_per_week : req.body.day_per_week,
        from_time : req.body.from_time,
        to_time : req.body.to_time.substr(0,10),
        from_day : req.body.from_day.substr(0,10),
        to_day: req.body.to_day,
        resource_id : req.body.resource_id,
        status : true
      }
      console.log(data.to_time,data.from_day)
      baseModel.add(req,res,shifts,data,callback1,true);

}

exports.getShift = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else{
      var data={
        _id:'',
        club_key :'',
        branch_key : '',
        units_key : '',
        user_key : '',
        shift_type : '',
        day_per_week : '',
        from_time : '',
        to_time : '',
        from_day : '',
        to_day: '',
        resource_id : '',
        status : true
      }

      var result = new Array();
      var i=1;
      Object.keys(obj).forEach(function(key) {
        var shift = obj[key];
          var oneshifts = new Object(); oneshifts['increment']=i;i++;
        Object.keys(data).forEach(function(index) {
          if(shift[index] != undefined) oneshifts[index]=shift[index];
          else oneshifts[index]=data[index];
        });
        result.push(oneshifts);
      });

      callback(result,false);
    }
  }
  console.log(where);
  baseModel.get(req,res,shifts,where,select,callback1,true);
}
/******test */
exports.getjoinShift = function(req,res,where,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else callback(obj,false);
  }
  baseModel.getJoin(req,res,shifts,'timescheduals','_id','shift_id',callback,where,true);
}
exports.asyncgetShift = async function(req,res,where,select){
  return await baseModel.ascynget(req,res,shifts,where,select,true);
}
/*****test */
exports.updateShift = function(req,res,callback){
  var callback1 = function(obj,error){
    if(obj.n) callback(true);
    else callback(false);
  }
  // var data={
  //   user_key : req.body.user_key,
  //   shift_type : req.body.shift_type,
  //   day_per_week : req.body.day_per_week,
  //   from_time : req.body.from_time,
  //   to_time : req.body.to_time,
  //   from_day : req.body.from_day,
  //   to_day: req.body.to_day,
  //   resource_id : req.body.resource_id,
  //   status : true
  // }
  if(req.body.from_day) req.body.from_day = req.body.from_day.substr(0,10);
  if(req.body.to_day) req.body.to_day = req.body.to_day.substr(0,10);
  if(req.body.resource_id =='') delete req.body.resource_id;
  baseModel.updateoradd(req,res,shifts,{_id:req.params.id},req.body,callback1,true);
}

exports.deleteShift = function(req,res,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req,res,shifts,{_id:req.params.id},callback1,false,true);
}
