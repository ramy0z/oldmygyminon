var baseModel = require('../models/baseModel');
var attendance = require('../models/attendance/attendance');
var membershipandpayment = require('../models/membership/membershipandpayment');
var timeschedual = require('./timeschedualCrl');
var shifts = require('./shiftsCrl');
var realeseTime = require('./realesetimeClass')
var membershipCrl = require('./membershipCrl')
var users=require('../models/users/user')
var mongoose = require('mongoose')
var log = require('./logCrl')
const ObjectId = mongoose.Types.ObjectId;
var addattendance = function (req, res, data, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
    //log.add(req, res,'addattendance','attendances',obj[0]._id,'',obj[0]);
  }
  baseModel.add(req, res, attendance, data, callback1, true);
}
exports.addattendance = addattendance;

exports.getattendance = function (req, res, where, select, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }
  baseModel.get(req, res, attendance, where, select, callback1, true);
}

exports.updateattendance = function (req, res, data, where, callback) {
  var callback1 = function (obj, error) {
    //console.log(obj)
    if (obj.n) callback(true);
    else callback(false);
  }
  var getcallback = function (error, result) {
    //log.add(req, res,'updateattendance','attendances',result[0]._id,result[0],data);
  }
  this.getattendance(req, res, where, {}, getcallback);
  baseModel.update(req, res, attendance, where, data, callback1, true);
}

exports.updateattendanceandcheckin = function (req, res, callback) {
  console.log(req.body)
  if (req.body._idAttendance) {
    try {
     var callbackget=function(result)
     {
      if(result[0].status=='attended')
      {
        callback({ result: true, data: 'You already checked in' });
      }
      else
      {
      var callback1 = function (obj, error) {
        //console.log(obj)
        if (obj.n&&obj.nModified) 
        {
          console.log(obj)
          callback({ result: true, data: 'You successfully checkedin' });
        }
        else if(obj.n)
        callback({ result: true, data: 'You already checked in' });
  
        else callback({ result: true, data: 'Sorry,An error occurred. try again' });
      }
      baseModel.update(req, res, attendance, { _id: ObjectId(req.body._idAttendance)}, { 'status': 'attended',checkin:req.body.checkin }, callback1, true);  
    }
  }
  
      baseModel.get(req,res,attendance,{ _id: ObjectId(req.body._idAttendance)},{status:1},callbackget)
    } catch (error) {
      callback({ result: true, data: 'Sorry,An error occurred. try again' });
      
    }
  
  }
  else if (!req.body._idAttendance && req.body._idMembershipandpayment) {
    var membershipandpayments = function (result) {
      if (result.length > 0) {
        if (result[0].type == 'general') {
          //date 
          try {
            let date = parseInt(req.body.checkin)
            day = new Date(date).getFullYear()
            let m = (new Date(date).getMonth() + 1)
            if ((m / 10) < 1) m = '0' + m
            day = day + '-' + m
            let d = (new Date(date).getDate())
            if ((d / 10) < 1) d = '0' + d
            day = day + '-' + d
           console.log(day)
           console.log('data',result)
            //callback
            var getcallback = function (resul) {
             
              var data =
              {
                club_key:result[0].club_key,
                branch_key:result[0].branch_key,
                user_key:req.body.user_key,
                membershipandpayment_id:req.body._idMembershipandpayment,
                checkin:req.body.checkin,
                checkinDay:day
              }
              if (resul.length > 0) {
                console.log(result)
                callback({ result: true, data: 'You already checked in' })

              }
              else { 
                    var checkincallback = function (result) {
                

                      if(result._id)
                      {
                      callback({ result: true, data: 'You successfully checkedin' })
                      }
                      else
                      {
                      callback({ result: true, data: 'Sorry,An error occurred. try again' })

                      }
                    }
                    baseModel.add(req, res, attendance, data, checkincallback) 
              }
            }
            baseModel.get(req, res, attendance, { 'membershipandpayment_id': req.body._idMembershipandpayment, checkinDay: day }, {}, getcallback)

          } catch (error) {
            callback({ result: true, data: 'invalid checkin date' })
          }

          //update
        }
        else {
          callback({ result: true, data: 'invalid membership' })
        }
      }
      else {
        callback({ result: true, data: 'Invalid membership or user' })
      }
    }
    baseModel.get(req, res, membershipandpayment, { _id: ObjectId(req.body._idMembershipandpayment),pub_key:req.body.user_key }, { }, membershipandpayments)
  }
  else {
    
    callback({ result: true, data: 'Invalid membership ' })
  }
}

exports.deleteattendance = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  var getcallback = function (error, result) {
    //log.add(req, res,'deleteattendance','attendances',result[0]._id,result[0],'');
  }
  this.getattendance(req, res, { _id: req.params.id }, {}, getcallback);

  baseModel.delete(req, res, attendance, { _id: req.params.id }, callback1, false, true);
}



exports.cancelAttendance = function (req, res, callback) {
  var getattendanceCallback = function (objects) {
    //console.log(objects);
    if (objects && objects.length > 0) {
      var gettimesechedual = function (timesinterval) {
        if (timesinterval && timesinterval.length > 0) {
          let newInterval = realeseTime.BackTimeToTimeschedule(timesinterval[0].interval, objects[0].from, objects[0].to)
          updateTimesintervalCallBack = function (res) {
            callback(true, '')
          }
          timeschedual.updatetimeschedual(req, res, { 'interval': newInterval }, { day_date: objects[0].day, shift_id: ObjectId(objects[0].shift_id) }, updateTimesintervalCallBack)
        }
      }
      var cancelattendanceCallback = function (obj) {

        if (obj.nModified) {
          timeschedual.gettimeschedual(req, res, { day_date: objects[0].day }, {}, gettimesechedual)
          // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
          pref_id = '';
          ref_id = req.body.id;
          log.add(req, res, 'cancelAttendance', 'attendances', 'PT_attendance_cancel', ref_id, pref_id);

        }
        else callback(false, 'not canceld');
      }

      //log.add(req, res,'cancelAttendance','attendances','',objects,'');

      var where = { _id: ObjectId(req.body.id), $or: [{ status: { $ne: 'cancel' } }, { status: { $ne: 'reschedual' } }] }
      baseModel.update(req, res, attendance, where, { status: 'cancel' }, cancelattendanceCallback, true);
    } else callback(false, 'invalid data');
  }
  baseModel.get(req, res, attendance, { _id: ObjectId(req.body.id) }, {}, getattendanceCallback, true);
}

//reschedual
exports.showTimesBeforeReschedual = function (req, res, callback) {
  var getattendanceCallback = function (objects) {

    if (objects.length > 0) {
      var startday = new Date(objects[0].day).getTime();
      var endday = parseInt(req.body.end_date + 7200000);
      var membershipandpayment_id = objects[0].membershipandpayment_id;
      var user_key = objects[0].user_key;
      var units_key = objects[0].units_key;
      //console.log(startday, endday);
      var alldays = [];
      for (var i = startday; i <= endday; i += 604800000) {
        alldays.push(timeschedual.getDateFormate(i));
      }
      var getattendanceCallback = function (allobjects) {

        var data = [];
        Object.values(allobjects).forEach(async function (obj) {
          data.push({ id: obj['_id'], day: obj['day'], from: obj['from'], to: obj['to'] })
        });
        callback(true, data);
      }
      var where = { day: { $in: alldays }, membershipandpayment_id, user_key, units_key };
      where['$or'] = [{ branch_key: req.query.parent_key }, { club_key: req.query.parent_key }, { units_key: req.query.parent_key }]
      baseModel.get(req, res, attendance, where, {}, getattendanceCallback, true);
    } else callback(false, 'invalid data');
  }
  baseModel.get(req, res, attendance, { _id: req.body.id }, {}, getattendanceCallback, true);
}
//reschedual
exports.reschedualAttendance = function (req, res, callback) {
  req.query.perpage = 10000;
  //console.log(req.body.endoldday, req.body.startoldday, req.body.endoldday)
  if (isJson(req.body.reservation)) var reservation = JSON.parse(req.body.reservation);
  else var reservation = req.body.reservation;

  newday = parseInt(reservation[0].from);
  var membershipandpayment_id = req.body.membership_id;
  if (membershipandpayment_id == undefined || membershipandpayment_id.length != 24)
    return callback(false, 'invalid packages');

  var membershipDays = []
  var membershipDaysWithTime = [{}]

  var getattendanceCallback = function (objects) {

    if (objects && objects.length > 0) {
      console.log(objects.length, objects[0].timescheduals.length, req.body.startoldday, req.body.endoldday)
      //array define to save _id to update membership with status 'reschedual'
      _idArr = []
      req.body.start_date = newday;

      let rangeResevertion = (new Date(req.body.endoldday)) - (new Date(req.body.startoldday))
      // console.log(newday, objects.length)
      req.body.end_date = newday + (objects.length * (1000 * 60 * 60 * 24));
      // console.log('end_date',req.body.end_date)
      //checked days in attendance and time schedule
      checked = 0;
      objects.forEach(element => {
        membershipDays.push(element.day)
        _idArr.push(element._id)
        if (element.timescheduals && element.timescheduals.length > 0) {
          newinterval = realeseTime.BackTimeToTimeschedule(element.timescheduals[0].interval, element.from, element.to)
          if (element.timescheduals[0]._id)
            membershipDaysWithTime.push({ 'key': { '_id': ObjectId(element.timescheduals[0]._id) }, 'value': { 'interval': newinterval } })
          checked += 1;
          // console.log(element.timescheduals[0]._id, 'new', newinterval, 'old', element.timescheduals[0].interval)
        }
      })
      if (checked == objects.length) {
        var HandelAttendancecallback = function (result, data) {
          var ref_id = data; //_idsOfScadualArr  returned from handelattendance to log  
          if (result.invalid_days) {
            return callback(false, result);
          }
          else {
            var updateResult = function (result) {
              // console.log(result)
              if (result['result'].ok == 1) {
                var callback1 = function (result) {
                  //// add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
                  var trans_num = _idArr.length;
                  var ref_id = req.body.membershipandpayment_id;
                  var pref_id = '';
                  ref_scadual_arr = data;//_idsOfScadualArr  returned from handelattendance to log  
                  pref_scadual_arr = _idArr;
                  log.add(req, res, 'reschedualAttendance', 'attendances', 'PT_attendance_reschedule', ref_id, pref_id, trans_num, ref_scadual_arr, pref_scadual_arr);

                  return callback(result);
                };
                baseModel.update(req, res, attendance, { _id: { $in: _idArr } }, { status: 'reschedual' }, callback1, true);
              } else callback(false, 'cant update timeschedule')
            }
            if (membershipDaysWithTime.length > 0)
              timeschedual.updateMultirowsWithDiffData(req, res, membershipDaysWithTime, updateResult)
            else
              callback(false, 'dont have days with this attendances')
          }
        }
        handelAttendance(req, res, 0, 0, membershipandpayment_id, HandelAttendancecallback);
      }
      else
        callback(false, 'incorrect  timescheduals data')
    }
    else {
      return callback(false, 'incorrect attendance data ')
    }
  }
  if (req.body._idAttendance) where = { _id: ObjectId(req.body._idAttendance), 'timescheduals.day_date': { $gte: req.body.startoldday } }
  else where = { day: { $gte: req.body.startoldday, $lte: req.body.endoldday }, status: 'active', user_key: req.body.user_key, membershipandpayment_id: ObjectId(req.body.membership_id) };
  where['$or'] = [{ branch_key: req.query.parent_key }, { club_key: req.query.parent_key }, { units_key: req.query.parent_key }]
  baseModel.getJointest(req, res, attendance, 'timescheduals', 'shift_id', 'shift_id', getattendanceCallback, where);

}



//handle users attendance
var handelAttendance = function (req, res, month_count, month_system, membershipandpayment_id, callback) {
  //get the start and end package date
  var haveerror = new Array();
  var weeks = { '1': 'monday', '2': 'tuesday', '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday', '0': 'sunday' }
  //get the start and end package date
  var date = Math.floor(Date.now() / 1000) + 86400;

  if (req.body.start_date) var start_date = timeschedual.getDateFormate(parseInt(req.body.start_date));
  else var start_date = timeschedual.getDateFormate(date * 1000);

  if (req.body.end_date) var end_date = timeschedual.getDateFormate(req.body.end_date);
  else var end_date = timeschedual.getDateFormate(date * 1000, month_count, month_system);

  if (isJson(req.body.reservation)) var reservation = JSON.parse(req.body.reservation);
  else var reservation = req.body.reservation;

  var reservationsize = reservation.length;
  //define global vriables
  var units_key; var branch_key; var club_key;
  var results = new Array();
  var reservation_key = 1;

  //loop for all days selectedb users in week (ex sunday and friday)
  Object.values(reservation).forEach(async function (recerv) {
    var day_key = new Date(parseInt(recerv.from)).getDay();
    //define global vriable
    var shifts_ids = new Array(); var shifts_interval = new Object();
    //get the start and end time selected by users
    var userfrom = gethoursandminutes(recerv.from); var userto = gethoursandminutes(recerv.to);

    //get all days in the package range
    console.log(day_key, start_date, end_date);
    var alldays = timeschedual.get_day_date_per_package(day_key, start_date, end_date);
    var tempalldays = new Array();

    //get all shifts in specific day(ex saturday) used days and units key
    var where = {
      shift_type: 'pri', units_key: req.body.units_key, day_per_week: weeks[day_key]
      , from_time: { $lte: userfrom }, to_time: { $gte: userto }, status: 'true'
    }
    //get shifts
    await shifts.asyncgetShift(req, res, where, {}).then(allshifts => {
      //if o shifts in this days return error
      if (allshifts.length == 0) haveerror.push(alldays);
      //loop for all shifts in day
      Object.values(allshifts).forEach(async function (shift) {
        //check if all days reservied
        if (alldays.length != 0) {
          //get all shifts data
          units_key = shift.units_key; branch_key = shift.branch_key; club_key = shift.club_key;
          shifts_interval[shift._id] = { from: shift.from_time, to: shift.to_time, key: shift.user_key }
          shifts_ids.push(shift._id);
        }
      });
    });
    //end shifts
    //get all schedual data for all shifts
    var where = { shift_id: { $in: shifts_ids }, day_date: { $in: alldays } }
    await timeschedual.gettimeschedualAsync(req, res, where, {}).then(allscheduals => {
      //define global vriables as temp
      var cash = new Array(); var from; var to;
      //check for all schedual to check if shifts not have schedual
      Object.values(allscheduals).forEach(function (schedual) {
        shifts_ids.splice(shifts_ids.indexOf(schedual.shift_id), 1);
      });
      //if shift not have schedual
      if (shifts_ids.length) {
        //get shift data

        var trainer_key = shifts_interval[shifts_ids[0]].key;
        from = shifts_interval[shifts_ids[0]].from; to = shifts_interval[shifts_ids[0]].to;
        var newinterval = getinterval(from, to, userfrom, userto);
        var shift_id = shifts_ids[0];
        //pass all days to cash
        Object.values(alldays).forEach(function (day) {
          cash.push({ userfrom, userto, trainer_key, newinterval, shift_id, day });
        });
        //if all shifts have schedual
      } else {
        var i = 1;
        //loop for all schedual
        Object.values(allscheduals).forEach(function (schedual) {
          //check if all days not schedual yet
          if (alldays.length != 0) {
            //get shift data
            var shift_id = schedual.shift_id;
            var trainer_key = shifts_interval[shift_id].key;
            from = shifts_interval[shift_id].from; to = shifts_interval[shift_id].to;
            //check if schedual day in alldays array
            if (alldays.includes(schedual.day_date)) {
              //conert intervals to object
              var intervals = JSON.parse(schedual.interval);
              //check for all schedual day intervals
              Object.keys(intervals).forEach(function (interval) {
                var value = intervals[interval];
                //check if user interval selected in this schedual interval
                if (userfrom >= interval && userto <= value) {
                  //console.log(userfrom,interval,userto,intervals[interval]);
                  var schedual_id = schedual._id;
                  //delete old interval
                  delete intervals[interval];
                  //add new interval
                  if (interval != userfrom) intervals[interval] = userfrom;
                  if (userto != value) intervals[userto] = value;
                  //add this day to cash
                  cash.push({ userfrom, userto, trainer_key, shift_id, day: schedual.day_date, intervals, schedual_id })
                  //delete this day from alldays array
                  alldays.splice(alldays.indexOf(schedual.day_date), 1);
                }
              });
              //add day which looped in this array
              tempalldays.push(schedual.day_date);
            }
            //check if this the last loop
            if (i == allscheduals.length) {
              //بشوف الايام اللى مع شفت معين بس لسه مضفش فيها اى وقت
              Object.values(alldays).forEach(function (day) {
                if (tempalldays.indexOf(day) < 0) {
                  var newinterval = getinterval(from, to, userfrom, userto);
                  cash.push({ userfrom, userto, trainer_key, newinterval, shift_id, day })
                  alldays.splice(alldays.indexOf(day), 1);
                }
              });
            }
          }
          i++;
        });
        //check if there is day not have avilable time
        if (allscheduals.length == (i - 1) && alldays.length != 0) haveerror.push(alldays);
      }
      results.push(cash);
    });
    //handel results by check if this last day selected
    if (reservation_key == reservationsize) {
      //check if there is error
      if (haveerror.length) callback({ 'invalid_days': haveerror }, []);
      //if there isnot any error
      else {
        //loop for all days in packages to add attendance and update schedual
        var updateMembership = true;
        let _idsOfScadualArr = [];
        var _arrOfInsertedAttendance = [];
        Object.values(results).forEach(function (result) {
          Object.values(result).forEach(function (obj) {
            //check if this day have schedualbefoe
            if (obj.schedual_id !== undefined)
              updateschedual(req, res, obj.schedual_id, JSON.stringify(obj.intervals));
            else addschedual(req, res, JSON.stringify(obj.newinterval), obj.shift_id, obj.day);

            //add attendance for all days in packages
            /////////addattendanceloop(req, res, obj.trainer_key, obj.shift_id, obj.day, obj.userfrom, obj.userto, membershipandpayment_id, club_key = club_key, branch_key = branch_key, units_key = units_key, user_key = req.body.user_key ,finalResultCB);
            // insate of for loop for add to db >>> only for loop then add all to dv
            var status = (req.body.status) ? req.body.status : 'pending-payment';
            data = {
              club_key: club_key,
              branch_key: branch_key,
              units_key: units_key,
              user_key: req.body.user_key,
              trainer_key: obj.trainer_key,
              shift_id: obj.shift_id,
              day: obj.day,
              from: obj.userfrom,
              to: obj.userto,
              membershipandpayment_id: membershipandpayment_id,
              status: status
            }
            _arrOfInsertedAttendance.push(data);
            //update selected membership schedual status
            if (updateMembership) {
              req.params.id = membershipandpayment_id;
              var handelresult = function () { };
              membershipCrl.updateSelectedpackage(req, res, { schedual_status: 'complete' }, handelresult);
              updateMembership = false;
            }
          });

        });
        callbackArr = function (result) {
          if (result.result['ok']) {
            result.result.insertedIds.forEach(ids => {
              _idsOfScadualArr.push(ids['_id']);
            });
            callback(true, _idsOfScadualArr);
          }
        }
        baseModel.insertManyDataInTheSameTime(req, res, attendance, _arrOfInsertedAttendance, callbackArr, true);
      }
    }
    reservation_key++;
  });

}



exports.handelAttendance = handelAttendance;
//update schedual function
var updateschedual = function (req, res, schedual_id, intervals) {
  var callback = function () { }
  timeschedual.updatetimeschedual(req, res, { interval: intervals }, { _id: schedual_id }, callback);
}
//add schedual function
var addschedual = function (req, res, newinterval, shift_id, day) {
  var callback = function () { }
  var data = {
    interval: newinterval,
    day_date: day,
    shift_id: shift_id,
    status: true
  }
  timeschedual.addtimeschedual(req, res, data, callback);
}
//add attendance loop
var addattendanceloop = function (req, res, trainer_key, shift_id, day, from, to, membershipandpayment_id, club_key, branch_key, units_key, user_key, callbac) {
  var callback = function (result) {
    callbac(result._id);
  }
  if (req.body.status) var status = req.body.status; else var status = 'pending-payment';
  var data = {
    club_key: club_key,
    branch_key: branch_key,
    units_key: units_key,
    user_key: user_key,
    trainer_key: trainer_key,
    shift_id: shift_id,
    day: day,
    from: from,
    to: to,
    membershipandpayment_id: membershipandpayment_id,
    status: status
  }

  addattendance(req, res, data, callback);
}
//view user schedual
exports.viewAttendance = function (req, res, data, callback) {
  var where = { $or: [], $and: [{}] };
  if (req.body._idAttendance != undefined) where['$and'].push({ _id: ObjectId(req.body._idAttendance) });
  //if (data.id != undefined) where['$and'].push({ _id: ObjectId(data['id']) });
  // if(data.membership_id != undefined && data.membership_id.length==24) where['$and'].push({membership_id:data['membership_id']});
  if (data.user_key != undefined) where['$and'].push({ user_key: data['user_key'] });
  //if(data.trainer_key != undefined) where['$and'].push({trainer_key:data['trainer_key']});
  if (data.status != undefined) where['$and'].push({ status: data['status'] });
  // if (data.club_key != undefined) where['$and'].push({ club_key: data['club_key'] });
  if (data.units_key != undefined) where['$and'].push({ units_key: data['units_key'] });
  //if (data.branch_key != undefined) where['$and'].push({ branch_key: data['branch_key'] });
  if (req.body.day_from != undefined) where['$and'].push({ day: { $gte: req.body['day_from'] } });
  if (req.body.day_to != undefined) where['$and'].push({ day: { $lte: req.body['day_to'] } });
  //console.log('status', data['status'])
  if (data = !{})
    where['$or'] = data.or;
  else {
    var where = {
      $or: [
        { 'branch_key': req.query.parent_key },
        { 'club_key': req.query.parent_key },
        { 'units_key': req.query.parent_key },

      ]
    }


  }

  var callback1 = function (obj, error) {

    if (error) callback(obj, error);
    else {
      var data = {
        _id: '',
        club_key: '',
        branch_key: '',
        units_key: '',
        trainer_key: '',
        from: '',
        to: '',
        membershipandpayment_id: '',
        status: '',
        day: ''
      }
      var result = new Array();
      Object.keys(obj).forEach(function (key) {
        var attendance = obj[key];
        var oneattencance = new Object();
        Object.keys(data).forEach(function (index) {
          if (attendance[index] != undefined) oneattencance[index] = attendance[index];
          else oneattencance[index] = data[index];
        });
        if (obj[key]['membershipandpayments'][0] != undefined)
          oneattencance['membership_id'] = obj[key]['membershipandpayments'][0].membership_id;
        oneattencance['from'] = new Date(attendance['day'] + ' ' + attendance['from']).getTime();
        oneattencance['to'] = new Date(attendance['day'] + ' ' + attendance['to']).getTime();
        result.push(oneattencance);

      });


      callback(result, false);
    }
  }
  baseModel.getJoin(req, res, attendance, 'membershipandpayments', 'membershipandpayment_id', '_id', callback1, where, true);
}

//get interval
var getinterval = function (from, to, userfrom, userto) {
  var newinterval = new Object();
  if (from != userfrom) newinterval[from] = userfrom;
  if (to != userto) newinterval[userto] = to;
  return newinterval;
}

function gethoursandminutes(date) {
  date = new Date(parseInt(date));
  return ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
}
exports.getattendanceAndTimeschedule = function (req, res, where, callback) {
  var getattendanceCallback = function (result) {
    callback(result)
  }
  baseModel.getJoin(req, res, attendance, 'timescheduals', 'shift_id', 'shift_id', getattendanceCallback, where);
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
//check if object is empty
Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

exports.activeAndDeactiveAttendance = function (req, user_key, res, status, callback) {
  req.query.perpage = 10000000;
  var handelresult = function (data, err) {
    callback(data.length)
  }

  var data = {
    user_key: user_key,
    status: status,
    or: [
      { branch_key: req.query.parent_key },
      { club_key: req.query.parent_key },
      { units_key: req.query.parent_key }
    ]
  }

  this.viewAttendance(req, res, data, handelresult);
}

// exports.getattendance=function(req,res,where,callback)
// {
//   var callback1=function(result)
//   {
//        callback(result)
//   }
//  baseModel.get(req,res,attendance,where,{},callback1)
// }

exports.getreportsattendance = function (req, res, where, callback) {
  var callback1 = function (result) {
    obj = {}

    attendances = []
    result.forEach(element => {
      obj = {}
      obj._id = element._id;
      obj.from = new Date(element['day'] + ' ' + element['from']).getTime()
      obj.to = new Date(element['day'] + ' ' + element['to']).getTime()
      obj.membershipandpayment_id = element.membershipandpayment_id
      obj.status = element.status
      obj.day = element.day;
      if (element.users.length > 0) obj.memberName = element.users[0].name; else obj.memberName = ""
      if (element.units.length > 0) obj.unitsName = element.units[0].name; else obj.unitsName = ""
      if (element.trainer.length > 0) obj.trainerName = element.trainer[0].name; else obj.trainerName = ""
      if (element.memberships.length > 0)
        obj.membershipName = element['memberships'][0].title; else obj.membershipName = "";
      if (element.membershipandpayments.length > 0)
        obj.membershipType = element['membershipandpayments'][0].type; else obj.membershipType = "";
      if (element.club.length > 0) { obj.clubName = element.club[0].name, obj.club_key = element.club[0].pub_key } else obj.clubName = ""
      // if (element.branch.length > 0) {obj.branchName = element.branch[0].name ,obj.club_key=element.club[0].pub_key} else obj.clubName = ""
      // if (element.units.length > 0) {obj.branchName = element.branchName[0].name ,obj.club_key=element.club[0].pub_key} else obj.clubName = ""
      attendances.push(obj)
    });
    var callbackCountRow = function (result1) {
      let total = 0
      if (result1.length > 0) total = result1[0].total
      callback({ data: attendances, totalItem: total })

    }

    baseModel.getRowsCount(req, res, attendance, where, callbackCountRow)
  }
  baseModel.getJoin5(req, res, attendance,
    'users', 'user_key', 'pub_key',
    'users', 'units_key', 'pub_key',
    'users', 'trainer_key', 'pub_key',
    'users', 'club_key', 'pub_key',
    'membershipandpayments', 'membershipandpayment_id', '_id', callback1, where)
}

//upcoming session 
exports.getupcomingattendance = function (req, res, where, callback) {
  var callback1 = function (obj, error) {
    callback(obj)
  }
  baseModel.getupcomingSession(req,res,attendance,where,callback1)
}


