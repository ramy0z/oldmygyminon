var baseModel = require('../models/baseModel');
var timeschedual = require('../models/timeschedual/timeschedual');
var shifts = require('./shiftsCrl');

exports.addtimeschedual = function(req,res,data,callback){
      var callback1 = function(obj,error){
        if(error) callback(obj,error);
        else callback(obj,false);
      }

      // var data={
      //   interval : req.body.interval,
      //   day_date : req.body.day_date ,
      //   shift_id : req.body.shift_id,
      //   status : true
      // }

      baseModel.add(req,res,timeschedual,data,callback1,true);

}

var gettimeschedual = function(req,res,where,select,callback){
  var callback1 = function(obj,error){
    if(error) callback(obj,error);
    else callback(obj,false);
  }
  baseModel.get(req,res,timeschedual,where,select,callback1,true);
}
exports.gettimeschedual=gettimeschedual;

exports.gettimeschedualAsync = function(req,res,where,select){
  return baseModel.ascynget(req,res,timeschedual,where,select,true);
}
exports.updatetimeschedual = function(req,res,data,where,callback){
  var callback1 = function(obj,error){
    if(obj.n) callback(true);
    else callback(false);
  }
  baseModel.updateoradd(req,res,timeschedual,where,data,callback1,true);
}

exports.deletetimeschedual = function(req,res,callback){
  var callback1 = function(obj,error){
    if(! obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req,res,timeschedual,{},callback1,false,true);
}
/*
*
*get all schedual of specific package
*/
exports.getSchedual = function(req,res,package,monthstyle,session,callback){

  //get the start and end package date
  var date = Math.floor(Date.now())+86400000;
  console.log(req.body.start_date,get_UTC_timestamp(parseInt(req.body.start_date)));
  if(req.body.start_date) var start_date = getDateFormate(parseInt(req.body.start_date));
  else var start_date = getDateFormate(date*1000);

  var end_date = getDateFormate(start_date,package,monthstyle);
  //define result array (cash)
  var result = {'0':{},'1':{},'2':{},'3':{},'4':{},'5':{},'6':{}};
  //array of week days used for loop
  var weeks = {'0':'sunday','1':'monday','2':'tuesday','3':'wednesday','4':'thursday','5':'friday','6':'saturday'}
  //used this as increment to return last operation occured in last day of week
  var k=0;

  //loop for all week days
  Object.keys(weeks).forEach(function(day_key) {
    var day = weeks[day_key];
    //get all days date of packaged ex (get all staurday in packages)
    var alldays = get_day_date_per_package(day_key,start_date,end_date);
    //define all saturday as array to pass intervals to it
    Object.keys(alldays).forEach(function(_key) {
      result[day_key][alldays[_key]] = [];
    });
   //callback function for all shift in specific day
   function getshiftcallback(allshifts,error){

     //increment to return last operation occured in last day of week
     if(allshifts.length ==0) k++;
     //used to check if object have last element
     var i =1;
      //check if units not have shifts
      if(allshifts.length==0 && k==7)
        return callback(comparesAllDays(comparesSecdula(result),parseInt(session*60000)));


      //loop for all shifts in specific day
      Object.values(allshifts).forEach(function(shift) {

        //get shift interval
        var from = shift.from_time; var to = shift.to_time;
        var shift_value =new Object();shift_value[from]=to;
        //define this to set days which haven't schedual to take deflaut shift value
        var loopdays= new Array();
        //callbacl function all schedual for shift in specific days (all saturdays)
        var schedualCallback = function(allscheduals,error){


          //loop for each schedual day
          Object.values(allscheduals).forEach(function(allschedual) {
            //conert intervals to object
            var interval = JSON.parse(allschedual.interval);
            //loop for intervals
            Object.keys(interval).forEach(function(key2) {
              //get all interval in one place
              var intervl_obj =new Object();intervl_obj[key2]=interval[key2];

              //check if shift date in package date
              if(allschedual.day_date >= shift.from_day && allschedual.day_date <= shift.to_day)
              result[day_key][allschedual.day_date].push(intervl_obj);
            });
            //save days which haven't schedual in this array
            loopdays.push(allschedual.day_date);
          });
          //loop to set days which haven't schedual to take deflaut shift value
          Object.values(alldays).forEach(function(allday) {
            if(!loopdays.includes(allday)){
              //check if shift date in package date
              if(allday >= shift.from_day && allday <= shift.to_day)
                result[day_key][allday].push(shift_value);
            }
          });
          //increment to return last operation occured in last day of week
          if(i==1) k++;
          //check if all operation done

          if(allshifts.length == i && k == 7){
            k=0;
            callback(comparesAllDays(comparesSecdula(result),parseInt(session*60000)));
          }
          i++;
        }
        //get all schedual for shift in specific days (all saturdays)
        var where = { shift_id:shift._id,day_date:{ $in: alldays}}

        gettimeschedual(req,res,where,{},schedualCallback);
      });

    }
    //get all shifts in specific day(ex saturday) used days and units key
    var where = { shift_type:'pri',units_key:req.body.units_key,day_per_week:day,status:'true'}
    shifts.getShift(req,res,where,{},getshiftcallback);
  });
}
/*
*
// compare between all times and get union intervals
*/
var comparesSecdula =function(allschedual){
  var lastresult = allschedual;
  //loop for data get from getSchedual function to get union intervals
  Object.keys(allschedual).forEach(function(day) {
    //day mean 0-6
    //loop for each days in specific days (ex all days which name saturday)
    Object.keys(allschedual[day]).forEach(function(dayByDate) {
      //dayByDate mean 20-4-2016
      var timearrays = allschedual[day][dayByDate];
      if(timearrays.length){
         var _result = comparesSecdulloopconditions(timearrays);
         var lastobject=_result.lastobject;var lastpoint=_result.lastpoint;
         //save data get from compare
         lastresult[day][dayByDate]=[];
         lastresult[day][dayByDate].push(lastobject);

         //other point which out of range (do the privious step to get union data)
         var _result = comparesSecdulloopconditions(lastpoint);
         lastobject=_result.lastobject;lastpoint=_result.lastpoint;
         //save data get from compare
         lastresult[day][dayByDate].push(lastobject);
         Object.values(lastpoint).forEach(function(point){
           lastresult[day][dayByDate].push(point);
         });
         return lastresult;

       }
    });
  });
  return lastresult;
}

/*
*
//compare between all days to get Intersection between days
*/
var comparesAllDays = function(allschedual,session=0){
  var lastresult = new Object();
  //loop for data get from comparesSecdula function to get Intersection intervals
   Object.keys(allschedual).forEach(function(day) {
    //day mean 0-6
    var day_date ; var currentdays=new Array();
    var baseday = new Array();
    var i=1;
    //loop for each days in specific days (ex all days which name saturday)
     Object.keys(allschedual[day]).forEach(function(dayByDate) {
      //dayByDate mean 20-4-2016
      //get base interval for compare
      if(i==1) {basedays=allschedual[day][dayByDate];day_date = dayByDate; i++; return;}
      var currentdays = allschedual[day][dayByDate];
      //used to set new interval for compare
      var range = new Array();
      //loop  for base interval
       Object.values(basedays).forEach(function(baseday) {
        var onekey= Object.keys(baseday)[0];var onevalue=baseday[onekey];
        //loop for second interval to compare
          Object.values(currentdays).forEach(function(currentday) {
          var from= Object.keys(currentday)[0];var to=currentday[from];
          //probability for compare
          if(onekey == from && onevalue >= to) {var lastobject = new Object();lastobject[onekey]=to;range.push(lastobject);}
          else if(onekey == from && onevalue < to)  {var lastobject = new Object();lastobject[onekey]=onevalue;range.push(lastobject);}

          else if(onekey > from && onevalue >= to && onekey <= to) {var lastobject = new Object();lastobject[onekey]=to;range.push(lastobject);}
          // else if(onekey > from && onevalue >= to && onekey > to)  {}
          else if(onekey > from && onevalue < to)  {var lastobject = new Object();lastobject[onekey]=onevalue;range.push(lastobject);}

          else if(onekey < from && onevalue < to && from < onevalue) {var lastobject = new Object();lastobject[from]=onevalue;range.push(lastobject);}
          //else if(onekey < from && onevalue < to && from > onevalue)  {}
          else if(onekey < from && onevalue >= to)  {var lastobject = new Object();lastobject[from]=to;range.push(lastobject);}
          //if(day==1) console.log(dayByDate,from,to,onekey,onevalue,range);

          //if(day == 5){console.log(i++,onekey,onevalue,from,to,range);}
        });
      });
      //set new interval to base interval
      basedays = range;
    });
    //handel result get from specific day (ex saturday)
    if(i != 1) lastresult[day_date]=basedays;
  });


  //divided shcedua to interval
  if(session != 0){
    var result = [];
    Object.keys(lastresult).forEach(function(day) {
      Object.values(lastresult[day]).forEach(function(times) {
        Object.keys(times).forEach(function(time) {
          var st = new Date(day+' '+time).getTime();
          var end = new Date(day+' '+times[time]).getTime();
          var i=1;
          for(st;st<=end;st+=session){
            if(i!=1)
              //date
              //result.push({from:new Date(st-session),to: new Date(st)})
              //time stamp
              result.push({from:(st-session),to: st})
            i++;
          }
        });
      });
    });
    return result;
  }else return lastresult;
}
/*
*
* get the date formate by timestamp
* monthpackage mean number of months
* monthstyle mean month is 28 por full month
*/
var getDateFormate = function(time='',monthpackage=null,monthstyle=null){
  //get the date by timestamp
  var dateObj = new Date(time);
  //check if month is 28  day
  if (monthstyle){
    var endtime = (dateObj.getTime()+(monthpackage*(monthstyle-1)*86400000));
    dateObj = new Date(endtime);
  }
  //check of the number of months
  else if(monthpackage) dateObj.setMonth(dateObj.getMonth()+parseInt(monthpackage));
  //get day ,month and year
  var month = dateObj.getMonth() + 1; //months from 1-12
  var day = dateObj.getDate();
  var year = dateObj.getFullYear();

  if(month.toString().length == 1) month = '0'+month;
  if(day.toString().length == 1) day = '0'+day;
  var newdate = year + "-" + month + "-" + day;
  return newdate;
}
exports.getDateFormate=getDateFormate;
/*
* get all days in period date ex(aqll days between 20-10-2018 and 30-11-2018)
*/
var get_day_date_per_package = function(day,start,end){
  var sat = new Array();
  start = start.split("-");
  start=start[1]+"/"+start[2]+"/"+start[0];
  var start = new Date(start).getTime();

  end = end.split("-");
  end=end[1]+"/"+end[2]+"/"+end[0];
  var end = new Date(end).getTime();
  for(var i=start;i<=end;i=i+86400000){
    var newDate = new Date(i);
    if(newDate.getDay() == day){
        sat.push(getDateFormate(i));
    }
  }
  return sat;
}
exports.get_day_date_per_package=get_day_date_per_package;

/*
*
*
*/
var comparesSecdulloopconditions= function(timearrays,lastresult,day,dayByDate){
  var i=1;
  //define this to set interval which out of union (not in range)
  var lastpoint = new Array();
  //define this as abase for compare
  var onekey;var onevalue;
  //loop for each intervals in specific day (intervals in 20-4-2019)
  Object.keys(timearrays).forEach(function(timearray){
    var timeobject = timearrays[timearray];
    //loop to compare between intervals
    Object.keys(timeobject).forEach(function(from){
      var to =timeobject[from];
      //this user to get base interval for compare
      if(i==1){onekey=from;onevalue=to; i++; return;}
      //probability for compare
      if(onekey == from && onevalue < to) onevalue = to;
      else if(onekey > from && onevalue >= to && onekey <= to) {onekey=from;}
      else if(onekey > from && onevalue >= to && onekey > to)  {var lastobject = new Object();lastobject[from]=to;lastpoint.push(lastobject);}
      else if(onekey > from && onevalue < to)  {onekey=from;onevalue = to;}

      else if(onekey < from && onevalue < to && from <= onevalue) {onevalue = to;}
      else if(onekey < from && onevalue < to && from > onevalue)  {var lastobject = new Object();lastobject[from]=to;lastpoint.push(lastobject);}
    });

  });
  var lastobject = new Object(); lastobject[onekey]=onevalue;
  return {lastobject,lastpoint};
}

/***/
function get_UTC_timestamp(date){
  var d1 = new Date(date);
  var d2 = new Date( d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds() );
  var utc_timestamp = d2.getTime();

  return utc_timestamp;
}
/*
*check if object is empty
*/
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
exports.updateMultirowsWithDiffData=function(req,res,data,callback)
{
  var timeschedualResult=function(result)
  {
    callback(result)
  }
  baseModel.updateManyDataInTheSameTime(req,res,timeschedual,data,timeschedualResult,callback)
}
