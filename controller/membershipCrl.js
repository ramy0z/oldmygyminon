var baseModel = require('../models/baseModel');
var membership = require('../models/membership/membership');
var workouts = require('../models/membership/workouts');
var membershipandpayment = require('../models/membership/membershipandpayment');
var auth = require('../models/auth/auth');
var timeschedualCrl = require('./timeschedualCrl');
var attendanceCrl = require('./attendanceCrl');
var mediaCrl = require('./mediaCrl');
var emailCrl = require('./emailCrl');
var optionsCrl = require('./optionsCrl');
var activitiesCrl = require('./activitiesCrl');
var usermetas = require('./userCrl');
var usermeta = require('../models/users/userMeta')
var notifications = require('./notifications/notificationsCrl');
var realeseTime = require('./realesetimeClass');
//var option = require('./optionsCrl');
var mongoose = require('mongoose');
var log = require('./logCrl');
const mongosse = require('mongoose')
const objectId = mongosse.Types.ObjectId
var workoutsttendances = require('./../models/membership/attendanceworkouts')

const ObjectId = mongoose.Types.ObjectId;
exports.ASyncgetSelectedpackage = async function (req, res, where, select) {
  return await baseModel.ascynget(req, res, membershipandpayment, where, select, true);
}
exports.addPackages = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }

  var getbranchandunitsdatacallback = function (users) {
    if (req.body.club_key == undefined) req.body.club_key = req.query.parent_key;
    if (req.body.branch_key == undefined && req.body.units_key == undefined) {
      req.body.branch_key = req.query.parent_key;
      req.body.units_key = req.query.parent_key;
    }
    var branch_data = {}; var units_data = {};
    Object.values(users).forEach(function (user) {
      if (user.pub_key == req.body.branch_key) {
        Object.values(user.usermetas).forEach(function (usermeta) {
          if (usermeta.key == 'lat') branch_data['lat'] = usermeta.value;
          if (usermeta.key == 'lang') branch_data['lang'] = usermeta.value;
        })
      } else {
        Object.values(user.usermetas).forEach(function (usermeta) {
          if (usermeta.key == 'lat') units_data['lat'] = usermeta.value;
          if (usermeta.key == 'lang') units_data['lang'] = usermeta.value;
        })
      }
    })
    if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
    var data = {
      club_key: req.body.club_key,
      branch_key: req.body.branch_key,
      units_key: req.body.units_key,
      units_data: JSON.stringify(units_data),
      branch_data: JSON.stringify(branch_data),
      title: req.body.title,
      month_count: req.body.month_count,
      month_system: req.body.month_system,
      fees: parseInt(req.body.fees),
      taxs: req.body.taxs,
      discount: req.body.discount,
      renew_fees: req.body.renew_fees,
      renew_taxs: req.body.renew_taxs,
      renew_discount: req.body.renew_discount,
      payment_startegy: req.body.payment_startegy,
      type: req.body.type,
      discount_startegy: req.body.discount_startegy,
      start_discount: req.body.start_discount,
      end_discount: req.body.end_discount,
      image: req.body.image,
      discriptions: req.body.discriptions,
      session_time: req.body.session_time,
      day_per_week: req.body.day_per_week,
      additional_visits: req.body.additional_visits,
      additional_invitation: req.body.additional_invitation,
      additional_service: req.body.additional_service,
      status: true
    }

    //console.log(data, req.body);
    baseModel.add(req, res, membership, data, callback1, true);
  }
  usermetas.getUserByPublickeys(req, res, { pub_key: { $in: [req.body.branch_key, req.body.units_key] } }, getbranchandunitsdatacallback);
}

exports.getPackages = function (req, res, where, select, callback) {

  var callback1 = function (obj, error) {
    if (error) callback(false, error);
    else {
      var data = {
        _id: '',
        club_key: '',
        branch_key: '',
        units_key: '',
        title: '',
        month_count: '',
        month_system: '',
        fees: 0,
        taxs: '',
        payment_startegy: '',
        type: '',
        discount: '',
        renew_fees: '',
        renew_taxs: '',
        renew_discount: '',
        discount_startegy: '',
        start_discount: '',
        end_discount: '',
        image: '',
        discriptions: '',
        session_time: '',
        day_per_week: '',
        additional_visits: '',
        additional_invitation: '',
        additional_service: '',
        status: ''
      }
      var result = new Array();
      var i = 1;

      Object.keys(obj).forEach(function (key) {
        var package = obj[key];
        var onepackges = new Object(); onepackges['increment'] = i; i++;
        Object.keys(data).forEach(function (index) {

          if (package[index] != undefined) onepackges[index] = package[index];
          else onepackges[index] = data[index];
        });
        onepackges['discount'] = parseInt(onepackges['discount'])
        onepackges['subtotal'] = calculateDiscount(package['fees'], package['discount'], package['discount_startegy'], package['discount_startegy'], package['start_discount'], package['end_discount']);
        if (onepackges.image != '') onepackges.image = auth.siteurl() + onepackges.image;
        result.push(onepackges);
      });
      callback(true, result);
    }
  }
  baseModel.getJoin(req, res, membership, 'membershipandpayments', '_id', 'membership_id', callback1, where, true);
}

exports.updatePackages = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (obj.n) callback(true);
    else callback(false);
  }
  if (req.body.fees) req.body.fees = parseInt(req.body.fees);
  if (req.body.image) req.body.image = req.body.image.split(auth.siteurl())[1];
  baseModel.update(req, res, membership, { _id: req.params.id }, req.body, callback1, true);
}

exports.deletePackages = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req, res, membership, { _id: req.params.id }, callback1, false, true);
}

//add new membership and payments
exports.selectePackage = function (req, res, callback) {
  var membershipcallback = function (membership) {
    var notificationcallback = function () { }
    var addpackagecallback = function (result, err) {
      if (!err) {
        //ref_id=result["_id"]; // log the refrance id
        //pref_id=''; // log the parent refrance id (NO ID Because its New).
        var notificationData = '{"user_key":"' + result["pub_key"] + '","membership_id":"' + result["_id"] + '"}';
        var title = "New Membership has been sold"; var body = "New Membership has been sold";
        if (req.body.status == 'renew') { title = 'ReNew Package'; body = 'ReNew Package Selected'; }
        notifications.sendToDevice(req, res, result["pub_key"], notificationcallback, notificationData, title, body, '', '')
        notifications.sendToTopic(req, res, req.query.parent_key + '_membershipNotification', notificationcallback, notificationData, title, body, '', '');
        //  emailCrl.sendemailWithOptionCheck(req,res,notificationcallback,'',title,body,req.query.parent_key,'membershipNotification');
        //  emailCrl.addEmail(req,res,'admin',req.query.parent_key,'newpackage','','',notificationcallback)
      }
      callback(result, err)
    }

    var addactivitycallback = function (result, err) {
      if (!err) {
        var notificationData = '{"user_key":"' + result["pub_key"] + '","membership_id":"' + result["_id"] + '","type":"new"}';
        var title = 'New Activity has been sold'; var body = 'New Activity has been sold';
        if (req.body.status == 'renew') { title = 'ReNew Package'; body = 'ReNew Package Selected'; }
        notifications.sendToTopic(req, res, req.query.parent_key + '_membershipNotification', notificationcallback, notificationData, title, body, '', '');
        emailCrl.sendemailWithOptionCheck(req, res, notificationcallback, '', title, body, req.query.parent_key, 'membershipNotification');
        emailCrl.addEmail(req, res, 'admin', req.query.parent_key, 'newpackage', '', '', notificationcallback)
      }
      callback(result, err)
    }

    if (membership.length) {
      selectmemnership(req, res, membership, addpackagecallback);
    } else {
      var activitescallback = function (result, activity) {
        if (activity.length) {
          selectmemnership(req, res, activity, addactivitycallback);
        } else (callback({}, 'package not valid'));
      }
      activitiesCrl.getActivity(req, res, { _id: req.body.membership_id, status: 'true' }, {}, activitescallback);
    }
  }
  baseModel.get(req, res, membership, { _id: req.body.membership_id, status: 'true' }, {}, membershipcallback, true);
}

//get selected addPackages
exports.getSelectedpackage = function (req, res, where, select, callback) {
  //console.log('aaaaa',!(req.query.type_membership&&req.query.type_membership=='package'))

  //console.log('body', req.body)
  var callback1 = function (obj, error) {
    //console.log("data ",obj)
    if (error) callback(false, error);
    else {
      var data = {
        _id: '',
        branch_key: '',
        units_key: '',
        pub_key: '',
        membership_id: '',
        privious_membership_id: '',
        package_name: '',
        payment_method: '',
        payment_startegy: '',
        payment_status: '',
        payment_date: '',
        payment_action: '',
        schedual_status: '',
        start_date: '',
        end_date: '',
        type: '',
        discount: '',
        agreement: '',
        fees: '',
        visits: '',
        additional_visits: '',
        additional_invitation: '',
        additional_service: '',
        status: '',
        membership_status: '',
        units_key: ''
      }
      var result = new Array();
      var i = 1;
      // to select membership by userkey and id (if only send in body )

      Object.keys(obj).forEach(function (key) {
        var package = obj[key];
        var onepackges = new Object(); onepackges['increment'] = i; i++;
        Object.keys(data).forEach(function (index) {

          if (package[index] != undefined) onepackges[index] = package[index];
          else onepackges[index] = data[index];
        });
        onepackges['start_date'] = new Date(onepackges['start_date']).getTime();
        onepackges['end_date'] = new Date(onepackges['end_date']).getTime();
        //get membership data from join
        if (package['memberships'][0] != undefined) {
          onepackges['package_name'] = package['memberships'][0].title;

          if (req.body.status == 'renew') {
            //console.log('renew...')
            onepackges['status'] = 'renew'
            onepackges['price'] = package['memberships'][0].renew_fees;
          }
          else
            onepackges['price'] = package['memberships'][0].fees;
          onepackges['package_status'] = package['memberships'][0].status;
          onepackges['package_type'] = 'package';
          if (onepackges.image != '') onepackges.image = auth.siteurl() + package['memberships'][0].image;
          onepackges['title'] = package['memberships'][0].title;
          if (req.body.status == 'renew') {
            onepackges['taxs'] = package['memberships'][0].renew_taxs;
            onepackges['status'] = 'renew'
          }
          else
            onepackges['taxs'] = package['memberships'][0].taxs;
          onepackges['discriptions'] = package['memberships'][0].discriptions;

        } else if (package['activites'][0] != undefined && !(req.query.type_membership && req.query.type_membership == 'package')) {
          //onepackges['package_name']=package['activites'][0].units_key
          onepackges['package_name'] = package['activites'][0].title;
          onepackges['price'] = package['activites'][0].fees;
          onepackges['package_status'] = package['activites'][0].status;
          onepackges['type'] = 'activity';
          if (onepackges.image != '') onepackges.image = auth.siteurl() + package['activites'][0].image;
          onepackges['title'] = package['activites'][0].title;
          onepackges['taxs'] = package['activites'][0].taxs;
          onepackges['discriptions'] = package['activites'][0].discriptions;
        }

        if (onepackges.agreement != '') onepackges.agreement = auth.siteurl() + onepackges.agreement;
        result.push(onepackges);
      });
      callback(true, result);
    }
  }

  //filter by payment status
  if (req.query.payment) {
    var payment = req.query.payment.toString();
    where['$and'].push({ 'payment_status': payment });
  }
  //filter by schedual status
  if (req.query.schedual) {
    var schedual = req.query.schedual.toString();
    where['$and'].push({ 'schedual_status': schedual });
  }
  //filter by  status
  if (req.query.status) {
    var status = req.query.status.toString();
    where['$and'].push({ 'status': status });
  }

  //filter by  ids
  if (req.query.ids) {
    var ids = req.query.ids.toString();
    var ids = ids.split(',');
    var allids = [];
    Object.values(ids).forEach(function (id) {
      if (id.length == 24) allids.push(ObjectId(id));
    });
    where['$and'].push({ '_id': { $in: allids } });
  }
  //orderby
  //filter by privilidge
  if (req.query.orderby && req.query.order) {
    if (req.query.orderby == 'id') var sort = { _id: parseInt(req.query.order) }
    else if (req.query.orderby == 'name') var sort = { 'memberships.title': parseInt(req.query.order) }
    else if (req.query.orderby == 'price') var sort = { fees: parseInt(req.query.order) }
    else if (req.query.orderby == 'start_date') var sort = { start_date: parseInt(req.query.order) }
    else if (req.query.orderby == 'end_date') var sort = { end_date: parseInt(req.query.order) }
    else if (req.query.orderby == 'payment_date') var sort = { payment_date: parseInt(req.query.order) }
    else if (req.query.orderby == 'payment_method') var sort = { payment_method: parseInt(req.query.order) }
    else if (req.query.orderby == 'payment_status') var sort = { payment_status: parseInt(req.query.order) }
    else if (req.query.orderby == 'schedual_status') var sort = { schedual_status: parseInt(req.query.order) }
    else if (req.query.orderby == 'status') var sort = { status: parseInt(req.query.order) }
    else if (req.query.orderby == 'visits') var sort = { 'visits': parseInt(req.query.order) }
    else var sort = { createdat: -1 };
  } else var sort = { createdat: -1 };


  baseModel.getJoin3(req, res, membershipandpayment, 'memberships', 'membership_id', '_id', 'activites', 'membership_id', '_id', 'usermetas', 'branch_key', 'pub_key', callback1, where, true, sort);
}
//upate selected addPackages
exports.updateSelectedpackage = function (req, res, updateData, callback) {
  if (req.params.id.length == 24) {
    var callback1 = function (obj, error) {
      if (obj.n) callback(true);
      else callback(false);
    }
    baseModel.update(req, res, membershipandpayment, { _id: req.params.id }, updateData, callback1, true);
  } else callback(false, 'invalid package');
}

//upate selected addPackages
exports.paymentPackage = function (req, res, updateData, callback) {
  req.query.perpage = 10000;
  var clubDataCallback = function (obj) {
    //console.log(obj)
    var getPackage = function (result) {

      let data = {
        'CREATED': timeschedualCrl.getDateFormate(Date.now()),
        'USERNAME': result[0]['users'][0]['username'],
        'USEREMAIL': result[0]['users'][0]['email'],
        'PAYMENTMETHOD': req.body.payment_method,
        'PAYMENtSTRATEGY': result[0]['memberships'][0]['payment_startegy'],
        'FEES': result[0]['fees'],
        'MEMBERSHIPNAME': result[0]['memberships'][0]['title'],
        'TAXS': result[0]['memberships'][0]['taxs'],
        'discount': result[0]['discount'],
        'PRICE': result[0]['memberships'][0]['fees'],
        'Fees': result[0]['fees'],
        'CLUBNAME': obj['club_name'],
        'CLUBEMAIL': obj['email'],
        'CLUBEADDRESS': obj['address'],
        'CLUBPHONE': obj['phone'],
        'LOGO': obj['logo']
      }

      if (result[0]['payment_refund'] != undefined && parseInt(result[0]['payment_refund']) > 0) {
        var notificationcallback = function () { };
        //  console.log(result[0]['pub_key'],result[0]);
        var notificationData = '{"user_key":"' + result[0]['pub_key'] + '","membership_id":"' + result[0]['_id'] + '"}';
        var title = 'Refunds need approval'; var body = 'Refunds need approval';
        notifications.sendToDevice(req, res, result[0]['pub_key'], notificationcallback, notificationData, title, body, '', '');
        notifications.sendToTopic(req, res, req.query.parent_key + '_membershipNotification', notificationcallback, notificationData, title, body, '', '');
        emailCrl.sendemailWithOptionCheck(req, res, notificationcallback, '', title, body, req.query.parent_key, 'membershipNotification');
        auth.handelTransaction(req, res, result[0].club_key, 'attendanceRefund', result[0]['payment_refund'], result[0]._id);
      }

      updateData['agreement'] = mediaCrl.generateAgreementPDF(req, res, data).split(auth.siteurl())[1];
      if (req.params.id.length == 24) {
        var callback1 = function (obj, error) {

          if (!obj.n) callback(false);
          if (req.body.payment_status == 'complete') {
            updateData['payment_date'] = Date.now()
            updateData['payment_method'] = req.body.payment_method;
            // updateattendance dosent update here 
            var updateattednacecallback = function () { }
            attendanceCrl.updateattendance(req, res, { 'status': 'active' }, { membershipandpayment_id: req.params.id }, updateattednacecallback);

            if (!req.body.upgrade && !req.body.downgrade) {
              auth.handelTransaction(req, res, result[0].club_key, 'newMembershipSold', result[0]['fees'], result[0]._id);

              // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
              ref_id = req.params.id;
              pref_id = ''; //no parent cause its new 
              /// if rnew >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
              if (result[0].renew_membership_id) {
                pref_id = result[0].renew_membership_id;
                // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
                log.add(req, res, 'paymentPackage', 'membershipandpayments', 'renew_membership', ref_id, pref_id);
              }
              else {
                // add new to log
                log.add(req, res, 'paymentPackage', 'membershipandpayments', 'new_membership_sold', ref_id, pref_id);
              }


              callback(true);
            }

            else {
              if (req.body.upgrade || req.body.downgrade) {
                if (req.body.upgrade) var action = 'upgrade';
                else var action = 'downgrade';
                if (action == 'upgrade') auth.handelTransaction(req, res, result[0].club_key, 'membershipUpgrade', result[0]['payment_refund'], result[0]._id);
                else if (action == 'downgrade') auth.handelTransaction(req, res, result[0].club_key, 'membershipDowngrade', result[0]['payment_refund'], result[0]._id);

                var tempAttendanceCallback = function (result) {
                  //console.log(result)
                  if (result && result.length > 0) {
                    var membershipDaysWithTime = new Array();
                    result.forEach(element => {
                      if (element.timescheduals && element.timescheduals.length > 0) {
                        element.timescheduals.forEach(timeschedule => {
                          if (element.day == timeschedule.day_date) {
                            if (element.day == timeschedule.day_date)
                              newinterval = realeseTime.BackTimeToTimeschedule(timeschedule.interval, element.from, element.to)
                            if (timeschedule._id)
                              membershipDaysWithTime.push({ 'key': { '_id': ObjectId(timeschedule._id) }, 'value': { 'interval': newinterval } })
                          }
                        })
                      }
                    })
                    var updateResult = function (obj) {
                      if (obj['result'].nModified > 0) {
                        var updateattednacecallack = function (obj) {

                          if (obj) callback(true, 'updated')
                          else callback(false, 'not updated attendance')
                        }
                        attendanceCrl.updateattendance(req, res, { 'status': 'cancel' }, { membershipandpayment_id: req.body.privious_membership_id, 'status': { $in: ['temp-upgrade', 'temp-downgrade'] } }, updateattednacecallack);
                      }
                      else callback(false, 'not updated timeschedule')
                    }
                    if (membershipDaysWithTime.length > 0)
                      timeschedualCrl.updateMultirowsWithDiffData(req, res, membershipDaysWithTime, updateResult)
                    else callback(false, 'incorrect data')
                  } else callback(false, 'incorrect data')
                }
                attendanceCrl.getattendanceAndTimeschedule(req, res, { 'status': 'temp-' + action }, tempAttendanceCallback)

                var log_key_state = (action == 'upgrade') ? 'upgrade_membership' : 'downgrade_membership';
                ref_id = req.params.id;
                pref_id = result[0].privious_membership_id; //no parent cause its new 

                // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
                log.add(req, res, 'upgradeanddowngradePackage', 'membershipandpayments', log_key_state, ref_id, pref_id);
              }

            }
          }
          else callback(false);

        }
        baseModel.update(req, res, membershipandpayment, { _id: req.params.id }, updateData, callback1, true);

      } else callback(false, 'invalid package');
    }
    baseModel.getJoin2(req, res, membershipandpayment, 'memberships', 'membership_id', '_id', 'users', 'pub_key', 'pub_key', getPackage, { _id: ObjectId(req.params.id) })
  }
  usermetas.getUserData(req, res, clubDataCallback)
}

//calculate package discount
var calculateDiscount = function (fees, discount, discount_startegy, taxs, start_date = null, end_date = null) {
  if (start_date && end_date) {
    var date = Math.floor(Date.now() / 1000);
    date = timeschedualCrl.getDateFormate(date * 1000);
    if (date <= end_date && date >= start_date) {
      if (discount_startegy == 'present') {
        var result = parseInt(fees) - parseInt(discount);
      } else {
        var result = fees - ((parseInt(fees) * parseInt(discount)) / 100);
      }
    } else return fees;
  } else {
    if (discount_startegy == 'present') {
      var result = parseInt(fees) - parseInt(discount);
    } else {
      var result = parseInt(fees) - ((parseInt(fees) * parseInt(discount)) / 100);
    }
  }

  if (taxs == '' || taxs == undefined) taxs = 0;
  result = parseInt(fees) + ((parseInt(fees) * parseInt(taxs)) / 100);
  return result;
}

//upgrade and downgrade membership
exports.upgradeanddowngradePackage = function (req, res, action, callback) {
  var membershipcallback = function (membership) {
    if (membership.length) {
      var membershipandattendanceCallback = function (membershipandattendance) {
        if (membershipandattendance.length) {
          var upanddowncallback = function (result, err) {
            if (!err) {
              pref_id = req.body.privious_membership_id;// log the parent(privious) referance id of membership row 
              ref_id = result['_id'];// log the parent(privious) referance id of membership row 
              var notificationcallback = function () { }
              var notificationData = '{"user_key":"' + result["pub_key"] + '","membership_id":"' + result["_id"] + '","type":"' + action + '"}';
              if (action == 'upgrade') { var title = 'Membership Upgrade'; var body = 'Membership Upgrade'; log_key_state = 'upgrade_membership'; }
              else { var title = 'Membership Downgrade'; var body = 'Membership Downgrade'; log_key_state = 'downgrade_membership'; }

              // if refund calculate 
              if (req.body.oldAttedanceStatus == 'cancel') {
                var log_key_state = (action == 'upgrade' || action == 'downgrade') ? 'membership_refund' : 'PT_attendance_schedule_refund';
                // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
                log.add(req, res, 'upgradeanddowngradePackage', 'membershipandpayments', log_key_state, ref_id, pref_id);
              }

              notifications.sendToDevice(req, res, result["pub_key"], notificationcallback, notificationData, title, body, '', '')
              notifications.sendToTopic(req, res, req.query.parent_key + '_membershipNotification', notificationcallback, notificationData, title, body, '', '');
              emailCrl.sendemailWithOptionCheck(req, res, notificationcallback, '', title, body, req.query.parent_key, 'membershipNotification');
              emailCrl.addEmail(req, res, 'admin', req.query.parent_key, 'newpackage', '', '', notificationcallback)
            }
            callback(result, err);
          }
          selectmemnership(req, res, membership, upanddowncallback, action, membershipandattendance);
        } else (callback({}, 'privious package not valid'));
      }
      var where = { _id: ObjectId(req.body.privious_membership_id), payment_status: 'complete' }
      baseModel.getJoin(req, res, membershipandpayment, 'attendances', '_id', 'membershipandpayment_id', membershipandattendanceCallback, where, true);
    } else (callback({}, 'package not valid'));
  }
  baseModel.get(req, res, membership, { _id: req.body.membership_id, status: 'true' }, {}, membershipcallback, true);
}

// select member package
var selectmemnership = function (req, res, membership, callback, action = '', privious) {
  var date = Math.floor(Date.now() / 1000) + 86400;
  if (req.body.start_date) var start_date = req.body.start_date;
  else var start_date = timeschedualCrl.getDateFormate(date * 1000);

  if (req.body.end_date) var end_date = req.body.end_date;
  else var end_date = timeschedualCrl.getDateFormate(new Date(start_date).getTime(), membership[0].month_count, membership[0].month_system);

  if (req.body.discount == undefined || req.body.discount == '') req.body.discount = 0;

  req.body.fees = calculateDiscount(membership[0].fees, req.body.discount, membership[0].discount_startegy, membership[0].taxs)
  if (!req.body.fees) req.body.fees = 0;


  if (req.body.payment_status == 'compelete') var payment_date = timeschedualCrl.getDateFormate(Math.floor(Date.now() / 1000));
  else var payment_date = '';

  if (!req.body.schedual_status) var schedual_status = 'pending'; else var schedual_status = req.body.schedual_status;





  var branchDataCallabck = function (branchData) {
    if (branchData.length) {
      branchData.forEach(element => {
        if (element.key == 'country') {
          data.branch_country = element.value
        }
        if (element.key == 'city') {
          data.branch_city = element.value
        }
        if (element.key == 'lang') {
          data.branch_lang = element.value
        }
        if (element.key == 'lat') {
          data.branch_lat = element.value
        }
      })
    }
    var callback1 = function (obj, error) {
      var callback2 = function (obj2, error2) {
        if (error) callback(obj, error);
        else callback(obj, false);
      }
      if (action != '') {
        updateData = { status: action, next_membership_id: obj['_id'] }
        baseModel.update(req, res, membershipandpayment, { _id: req.body.privious_membership_id }, updateData, callback2, true);
      } else {
        callback2(obj, error)
      }

    }
    baseModel.add(req, res, membershipandpayment, data, callback1, true);
    //console.log(data)
  }

  var data = {
    club_key: membership[0].club_key,
    branch_key: membership[0].branch_key,
    units_key: membership[0].units_key,
    branch_data: membership[0].branch_data,
    units_data: membership[0].units_data,
    type: membership[0].type,
    pub_key: req.body.pub_key,
    membership_id: req.body.membership_id,
    payment_method: req.body.payment_method,
    payment_startegy: req.body.payment_startegy,
    payment_status: req.body.payment_status,
    schedual_status: schedual_status,
    payment_date: payment_date,
    discount: req.body.discount,
    fees: req.body.fees,
    original_fees: membership[0].fees,
    //hours: req.body.hours,
    start_date: start_date,
    end_date: end_date,
    visits: req.body.visits,
    additional_visits: req.body.additional_visits,
    additional_invitation: req.body.additional_invitation,
    additional_service: req.body.additional_service,
    status: 'active',
  }
  if (action != 'upgrade' && action != 'downgrade') {
    data.renew_membership_id = req.body.renew_membership_id;
  }


  if (action != '') {
    data['payment_action'] = action;
    data['privious_membership_id'] = req.body.privious_membership_id;
    if (req.body.oldAttedanceStatus == 'cancel')
      data['payment_refund'] = calculateRefund(req, res, action, membership[0], privious[0]);
  }
  baseModel.get(req, res, usermeta, { 'pub_key': membership[0].branch_key }, {}, branchDataCallabck)
}

var calculateRefund = function (req, res, action, membership, privious) {

  if (privious.type == 'private') {
    var count = 0; var attendance_ids = new Array();
    Object.values(privious['attendances']).forEach(function (attendance) {
      if (attendance['status'] == 'active') {
        attendance_ids.push(attendance['_id']);
        count++;
      }
    });
    var price = (privious['fees'] / privious['attendances'].length) * count;
    var callback = function () { }
    attendanceCrl.updateattendance(req, res, { 'status': 'temp-' + action }, { _id: { $in: attendance_ids } }, callback);

  }

  if (!parseInt(price)) price = 0;
  return price;
}
//renew package
// user sends  id of membership
// getting membership data as object from database
//remove id from this object
//then save this data in database as new package
exports.renewmembership = function (req, res, callback) {
  req.body.status = 'renew';
  var handelresult = (result, data) => {
    if (data[0]['status'] != 'upgrade' && data[0]['status'] != 'downgrade') {

      //console.log(data)
      if (data.length > 0) {
        var updateResult = (result) => {
          data.renew_membership_id = req.body.renew_membership_id;
          if (result) {
            data = data[0];

            req.body.renew_membership_id = req.body.id; //add membership renew parent id 

            delete req.body.id;
            req.body.units_key = data.units_key;
            req.body.membership_id = data.membership_id;
            req.body.payment_method = data.payment_method;
            req.body.payment_startegy = data.payment_startegy;
            req.body.status = data.status;
            req.body.pub_key = data.pub_key;
            req.body.additional_visits = data.additional_visits;
            req.body.additional_invitation = data.additional_invitation;
            req.body.additional_service = data.additional_service;
            req.body.payment_status = "pending";
            req.body.schedual_status = "pending";
            req.body.price = data.price;
            req.body.end_date = null;
            req.body.start_date = (new Date(parseInt(req.body.start_date)).toISOString()).slice(0, 10);
            var handelresult = function (result, err) {
              if (err) callback({ 'result': false });
              else {
                // ref_id = result['_id'];// to log  thr referancr id of membership;
                //  Object.defineProperty(result["_doc"],'units_key',{value:data.units_key})
                result = Object.assign({ 'units_key': data.units_key }, result["_doc"]);
                callback({ 'result': true, 'data': result });
              }
            }
            this.selectePackage(req, res, handelresult);
          }
          else {
            callback(false, error);
          }
        }
      }
      else {
        callback(false, error);
      }
      //modifiy the method
      req.params.id = req.body.id;
      this.updateSelectedpackage(req, res, { 'membership_status': 'renew' }, updateResult);
    }
    else {
      callback(false, 'invalid Action : Update Or Downgrade Membership Cant Be Renewed');
    }
  }
  var where = {
    $or: [
      { 'memberships.branch_key': req.query.parent_key },
      { 'memberships.club_key': req.query.parent_key },
      { 'memberships.units_key': req.query.parent_key },
      { 'activites.branch_key': req.query.parent_key },
      { 'activites.club_key': req.query.parent_key },
      { 'activites.units_key': req.query.parent_key },
      { createdat: req.body.createdat }
    ], $and: [{ pub_key: req.params.pub_key }, { _id: ObjectId(req.body.id) }]
  }
  this.getSelectedpackage(req, res, where, {}, handelresult);
}

// exports.membershipWillExpire = function(req,res,after=1){ ''
//   var allpackagecallback = function(result){
//     console.log(result);
//     var title="Membership Expiration";var body="Membership Expiration";
//     var notificationData = '';
//     Object.values(result).forEach(function(membership) {
//       var callback = function(){}
//       notificationData = '{"user_key":"'+membership["pub_key"]+'","membership_id":"'+membership["_id"]+'","topic":"membershipNotification"}';
//       notifications.sendToDevice(req,res,membership['pub_key'],callback,notificationData,title,body,'','')
//       emailCrl.sendemailWithOptionCheck(req,res,notificationcallback,'',title,body,req.query.parent_key,'membershipNotification');
//       emailCrl.addEmail(req,res,'admin',req.query.parent_key,'membershipexpire','','',notificationcallback)
//     })
//   }
//   var end_date = (new Date().getTime())+parseInt(after*86400000);
//   end_date = timeschedualCrl.getDateFormate(end_date);
//   var where = {end_date,schedual_status:'complete',payment_status:'complete'}
//   baseModel.get(req,res,membershipandpayment,where,{pub_key:1},allpackagecallback);
// }



exports.membershipWillExpire = function (req, res) {
  var allclubscallback = function (clubs) {
    Object.values(clubs).forEach(function (club) {
      var getOptionCallback = function (option) {
        if (option['checkExpirationColum'] != undefined) {
          var allpackagecallback = function (result) {
            //console.log(result);
            var title = "Membership Is Expiring soon"; var body = "Membership Is Expiring soon";
            var notificationData = '';
            var memberships_ids = new Array();
            var user_keys = new Array();
            var callback = function () { }
            Object.values(result).forEach(function (membership) {
              memberships_ids.push(membership["_id"]);
              user_keys.push(membership["pub_key"]);
              notificationData = '{"user_key":"' + membership["pub_key"] + '","membership_id":"' + membership["_id"] + '","topic":"membershipNotification","action":"expire"}';
              notifications.sendToDevice(req, res, membership['pub_key'], callback, notificationData, title, body, '', '')
              emailCrl.sendemail(req, res, '', title, body, membership['pub_key'], callback);
            });

            var title1 = "Memberships are Expiring soon"; var body1 = "Memberships are Expiring soon";
            notificationData1 = '{"user_key":"' + user_keys.toString() + '","membership_id":"' + memberships_ids.toString() + '","topic":"membershipNotification","action":"expire"}';
            if (result.length == 1) {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData, title, body, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title, body, club['_id'], 'membershipNotification');
            } else {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData1, title1, body1, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title1, body1, club['_id'], 'membershipNotification');
            }
          }

          var end_date = (new Date().getTime()) + parseInt(parseInt(option['checkExpirationDays']) * 86400000);
          end_date = timeschedualCrl.getDateFormate(end_date);
          var where = { units_key: club['_id'], schedual_status: 'complete', payment_status: 'complete' }
          where[option['checkExpirationColum']] = end_date;
          baseModel.get(req, res, membershipandpayment, where, { pub_key: 1 }, allpackagecallback);
        }
      }

      optionsCrl.getOption(req, res, { pub_key: club['_id'] }, {}, getOptionCallback)
    })
  }

  end_date = timeschedualCrl.getDateFormate(new Date());
  var key = { _id: '$units_key' };
  baseModel.getAggregate(req, res, membershipandpayment, key, allclubscallback);
}

exports.membershipStillHaventSchedual = function (req, res) {
  var allclubscallback = function (clubs) {
    Object.values(clubs).forEach(function (club) {
      var getOptionCallback = function (option) {
        if (option['checkSchedualColum'] != undefined) {

          var allpackagecallback = function (result) {
            // console.log(result);
            var title = "New Membership and still haven't Scheduled yet"; var body = "New Membership and still haven't Scheduled yet";
            var notificationData = '';
            var memberships_ids = new Array();
            var user_keys = new Array();
            var callback = function () { }
            Object.values(result).forEach(function (membership) {

              memberships_ids.push(membership["_id"]);
              user_keys.push(membership["pub_key"]);
              notificationData = '{"user_key":"' + membership["pub_key"] + '","membership_id":"' + membership["_id"] + '","topic":"membershipNotification","action":"notschedual"}';
              notifications.sendToDevice(req, res, membership['pub_key'], callback, notificationData, title, body, '', '')
              emailCrl.sendemail(req, res, '', title, body, membership['pub_key'], callback);
            });

            var title1 = "New Memberships and still haven't Scheduled yet"; var body1 = "New Memberships and still haven't Scheduled yet";
            notificationData1 = '{"user_key":"' + user_keys.toString() + '","membership_id":"' + memberships_ids.toString() + '","topic":"membershipNotification","action":"notschedual"}';
            if (result.length == 1) {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData, title, body, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title, body, club['_id'], 'membershipNotification');
            } else {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData1, title1, body1, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title1, body1, club['_id'], 'membershipNotification');
            }
          }

          var start_date = (new Date().getTime()) + parseInt(parseInt(option['checkSchedualDays']) * 86400000);
          start_date = timeschedualCrl.getDateFormate(start_date);
          var where = { units_key: club['_id'], schedual_status: 'pending' }
          where[option['checkSchedualColum']] = start_date + 'T22:00:00.000Z';

          baseModel.get(req, res, membershipandpayment, where, { pub_key: 1 }, allpackagecallback);
        }
      }

      optionsCrl.getOption(req, res, { pub_key: club['_id'] }, {}, getOptionCallback)
    })
  }

  var key = { _id: '$units_key' };
  baseModel.getAggregate(req, res, membershipandpayment, key, allclubscallback);
}


exports.membershipStillHaventpayment = function (req, res) {
  var allclubscallback = function (clubs) {
    Object.values(clubs).forEach(function (club) {
      var getOptionCallback = function (option) {
        if (option['checkPaymentColum'] != undefined) {

          var allpackagecallback = function (result) {
            //console.log(result);
            var title = "New Membership booked and still haven't Payment yet."; var body = "New Membership booked and still haven't Payment yet.";
            var notificationData = '';
            var memberships_ids = new Array();
            var user_keys = new Array();
            var callback = function () { }
            Object.values(result).forEach(function (membership) {

              memberships_ids.push(membership["_id"]);
              user_keys.push(membership["pub_key"]);
              notificationData = '{"user_key":"' + membership["pub_key"] + '","membership_id":"' + membership["_id"] + '","topic":"membershipNotification","action":"notschedual"}';
              notifications.sendToDevice(req, res, membership['pub_key'], callback, notificationData, title, body, '', '')
              emailCrl.sendemail(req, res, '', title, body, membership['pub_key'], callback);
            });

            var title1 = "New Memberships booked and still haven't Payment yet."; var body1 = "New Memberships booked and still haven't Payment yet.";
            notificationData1 = '{"user_key":"' + user_keys.toString() + '","membership_id":"' + memberships_ids.toString() + '","topic":"membershipNotification","action":"notschedual"}';
            if (result.length == 1) {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData, title, body, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title, body, club['_id'], 'membershipNotification');
            } else {
              notifications.sendToTopic(req, res, club['_id'] + '_membershipNotification', callback, notificationData1, title1, body1, '', '')
              emailCrl.sendemailWithOptionCheck(req, res, callback, '', title1, body1, club['_id'], 'membershipNotification');
            }
          }

          var start_date = (new Date().getTime()) + parseInt(parseInt(option['checkPaymentDays']) * 86400000);
          start_date = timeschedualCrl.getDateFormate(start_date);
          var where = { units_key: club['_id'], schedual_status: 'complete', schedual_pending: 'pending' }
          where[option['checkPaymentColum']] = start_date + 'T22:00:00.000Z';
          baseModel.get(req, res, membershipandpayment, where, { pub_key: 1 }, allpackagecallback);
        }
      }

      optionsCrl.getOption(req, res, { pub_key: club['_id'] }, {}, getOptionCallback)
    })
  }


  var key = { _id: '$units_key' };
  baseModel.getAggregate(req, res, membershipandpayment, key, allclubscallback);
}


exports.getattendanceDetails = function (req, res, where, callback) {
  var HandelAttendancecallback = function (result) {
    var obj = {}
    attendance_id = []
    membershipAttendances = []
    if (result) {
      if (result.length > 0) {
        //console.log(result)
        if (result[0].memberships.length > 0) {
          obj.membershipImage = []
          obj.membershipName = result[0].memberships[0].title
          obj.membershipPeroid = result[0].memberships[0].month_count
          obj.membershipDescription = result[0].memberships[0].discriptions
          obj.numberAttendancePerWeek = result[0].memberships[0].day_per_week
          obj.payment_startegy = result[0].memberships[0].payment_startegy
          if (result[0].memberships[0].image) {
            // let image=auth.siteurl()+result[0].memberships[0].image;
            let image = result[0].memberships[0].image.trim()
            image = auth.siteurl() + image
            obj.membershipImage.push(image)
          }
        }
        obj.membershipType = result[0].type
        obj.membershipAddress = { 'country': result[0].branch_country, 'city': result[0].branch_city, 'lat': result[0].branch_lat, 'lang': result[0].branch_lang }
        obj.membershipFees = result[0].fees
        obj.membershipStart_date = new Date(result[0].start_date).getTime()
        obj.membershipEnd_date = new Date(result[0].end_date).getTime()
        obj.membershipAttendance = result[0].attendances
        if (obj.membershipAttendance.length > 0) {
          obj.membershipAttendance.forEach(elem => {
            if (result[0]._id == elem.membershipandpayment_id) {
              attendance_id.push(objectId(elem._id))
              membershipAttendances.push(elem)
              elem.workouts = [];
            }
            obj.membershipAttendance = membershipAttendances
            obj.membershipAttendance.sort((a, b) => (a.day > b.day) ? 1 : ((b.day > a.day) ? -1 : 0));

          })
          //console.log(attendance_id)
          var workoutscallback = function (workouts) {

            if (workouts.length > 0) {
              obj.membershipAttendance.forEach(elem => {
                workouts.forEach(workout => {

                  //console.log(elem._id, workout.attendance_id)
                  if ((elem._id).toString()==(workout.attendance_id).toString()) {
                    if(workout.workouts)
                    elem.workouts=workout.workouts
                  }

                })
              })
            }
            callback(obj)
          }
          baseModel.getJoin_2(req, res, workoutsttendances, 'attendances', 'attendance_id', '_id', 'workouts', 'workouts_ids', '_id', workoutscallback, { 'attendance_id': { $in: attendance_id } })

        }
        else {
          callback(obj)
        }
        //obj.workouts = []
        if (result[0].club_name.length > 0)
          obj.membershipClubName = result[0].club_name[0]
        if (result[0].branch_name.length > 0)
          obj.membershipBranchName = result[0].branch_name[0]
        if (result[0].unit_name.length > 0)
          obj.membershipUnitName = result[0].unit_name[0]
      }
    }

  }
  baseModel.getJoinwithFlitration(req, res, membershipandpayment, 'memberships', 'membership_id', '_id', 'attendances', '_id.str', 'membershipandpayment_id.str', HandelAttendancecallback, where)

  //baseModel.getJoin2(req,res,membership,'membershipandpayments','membershipandpayment_id.str','_id.str',HandelAttendancecallback,where)
}


exports.getActivities = function (req, res, callback) {
  //define object of week
  var week = { '6': { first: 0, end: 6 } }
  for (let index = 0; index < 6; index++) {
    week[index] = { first: index + 1, end: 5 - (index) }
  }
  console.log('week', week,req.body.day)
  if (req.body.day) {
    //checked day 
    try {
      //get number of day in the week 
      var date = parseInt(req.body.day)
      var day = new Date(date).getDay()
      
      var firstday = new Date(date).setDate(new Date(date).getDate() - week[day]['first'])
      var endday = new Date(date).setDate(new Date(date).getDate() + week[day]['end'])
      firstday = convertStringDate(firstday)
      endday = convertStringDate(endday)
      var sessionday=convertStringDate(date)
      console.log(firstday,endday)
      //condition to get membership and attendance of week
      var where = { pub_key: req.params.id, firstday: firstday, endday: endday,sessionday:sessionday }

      //query to get membership with attendances 

      attendanceCrl.getupcomingattendance(req, res, where, (upcomingSessions) => {
        console.log('sessions',upcomingSessions)
        baseModel.getActivity(req, res, membershipandpayment, where, (result) => {
          var data = {}
          var activity = []
          var membrships = []
          //cobmine retrevie data int o membership and attendance
          if (result.length > 0) {
            result.forEach(membrship => {
              if (membrship.type == 'private' || membrship.type == 'general') {
                var image = []
                var membershipObj = {}
                //memebershipandapyment data
                membershipObj.type = membrship.type
                membershipObj.fees = membrship.fees
                membershipObj.start_date = membrship.start_date
                membershipObj.end_date = membrship.end_date
                membershipObj.address = {
                  country: membrship.branch_country,
                  city: membrship.branch_city,
                  lang: membrship.branch_lang,
                  lat: membrship.branch_lat
                }
                membershipObj.unitName = membrship.unit_name[0]
                membershipObj.branchName = membrship.branch_name[0]
                membershipObj.clubName = membrship.club_name[0]
                //original memberhip data
                if (membrship.memberships) {
                  if (membrship.memberships.length > 0) {
                    membershipObj.title = membrship.memberships[0].title
                    if (membrship.memberships[0].image)
                      image.push(membrship.memberships[0].image)
                    membershipObj.image = image
                  }
                }
                membershipObj.weeklyAttendance = {}
                //attendance data 
                if (membrship.attendances.length > 0) {
                  var weeklyAttendance = []
                  weeklyAttendance = membrship.attendances.filter(function (attendance) {
                    return attendance.membershipandpayment_id == membrship._id;
                  });
                   weeklyAttendance
                  if( weeklyAttendance.length>0){
                    var totalTime=0
                    var  restTime=0
                    weeklyAttendance.forEach(elem=>{
                        totalTime+=Mincalculate(elem['from'],elem['to'])
                        if(elem.status=='active')
                        restTime +=Mincalculate(elem['from'],elem['to'])
                    })
                    membershipObj.weeklyAttendance={totalTime,restTime} 

                  }
                  //upcoming session
                  membershipObj.upcomingSession={}
                  if(upcomingSessions.length>0)
                  {
                    var upcomingSession = upcomingSessions.filter(function (upcomingsession) {
                      return upcomingsession._id == membrship._id;
                    })
                  
                    if(upcomingSession.length>0)
                    if(upcomingSession[0]['attendance'])
                   membershipObj.upcomingSession=upcomingSession[0]['attendance']
                  }

                }
                //push in membership
                membrships.push(membershipObj)
              }
            })
            data.membrships=membrships
            data.activites=activity
            callback(data)
          }
        })
      })
    } catch (error) {
      res.send(error)
    }

  }
  console.log(req.body, req.params)

}



function search(nameKey, arr) {
  arr.forEach(element => {
    // console.log(element.attendance_id,nameKey)
    if (element.attendance_id == nameKey) {
      {
        return element.workouts
      };
    }
  });
  //  console.log('work',myArray[i]['attendance_id'])

}


// exports.getMebershipOfMember = function (req, res, where, callback) {
//   var membershipcallBack = function (result) {
//     console.log(result)
//     clubs=[]
//     if (result) {
//       if(result.length>0)
//       result=groupBy(result,'club_key')
//       console.log('res',result)
//       Object.keys(result).forEach((elem,index)=>{
//          if(result[elem].length>0)
//          {
//           clubs[index]={club_name:result[elem][0].club.name,
//             club_key:result[elem][0].club.pub_key}
//             clubs[index].branchs=[]
//           let branchs=(groupBy(result[elem],'branch_key'))
//            Object.keys( branchs).forEach((elem,i)=>{
//              let branch={}
//              branch.branch_name=branchs[elem][0].branch.name
//              branch.branch_key=branchs[elem][0].branch.pub_key
//              branch.memberships=[]
//              clubs[index].branchs.push(branch)
//              let memberships=(groupBy(branchs[elem],'_id'))
//              Object.keys( memberships).forEach((elem)=>{
//               let membership={}
//               membership.membership_name=memberships[elem][0].memberships.title
//               membership.membership_id=elem
//               clubs[index].branchs[i].memberships.push(membership)
//             })
//            })
//          }
//       })


//       callback({result:true,data:clubs })
//     }
//   }
//   baseModel.getfilterClub(req, res, membershipandpayment, 'memberships', 'membership_id', '_id', where, membershipcallBack)
// }


exports.getMebershipOfMember = function (req, res, where, callback) {
  var membershipcallBack = function (result) {
    //console.log(result)
    if (result) {
      var membership = {}
      var membeships = []
      var club = {}
      var clubs = []
      if (result.length > 0) {

        result.forEach(elem => {
          club = {}
          membership = {}
          if (elem.memberships.length > 0) {
            membership.membershipName = elem.memberships[0].title
            membership.membershipandpayment_id = elem._id
            membership.branch_key = elem.branch[0].pub_key
          }
          if (elem.club.length > 0) {
            club.club_name = elem.club[0].name
            club.club_key = elem.club[0].pub_key
          }
          if (elem.branch.length > 0) {
            club.branch_name = elem.branch[0].name
            club.branch_key = elem.branch[0].pub_key
          }
          //  if(elem.unit.length>0)
          //  {
          //   club.units_name=elem.unit[0].name
          //   club.units_key=elem.unit[0].pub_key
          //  }

          clubs.push(club)
          membeships.push(membership)
        })


        clubs = getUnique(clubs, 'branch_key')
        membeships = getUnique(membeships, 'membershipandpayment_id')
      }
      callback({ result: true, data: { membrships: membeships, branchs: clubs } })
    }
  }
  baseModel.getfilterClub(req, res, membershipandpayment, 'memberships', 'membership_id', '_id', where, membershipcallBack)
}
function getUnique(arr, comp) {

  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

  return unique;
}

function getUnique(arr, comp) {

  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

  return unique;
}
var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};





exports.getattendanceofmemberships = function (req, res, where, callback) {
  var membershipcallBack = function (result) {
    if (result.length > 0) {
      result.forEach(element => {
        if (element.attendances) {
          if (element.attendances.length > 0) {
            element.attendances = element.attendances.filter(function (attendance) {
              return attendance.membershipandpayment_id == element._id;
            });
          }
         // console.log(element._id, element.attendances.length)
        }
      });

    }
    callback(result)
  }
  if (req.params.pub_key)
    baseModel.getmembershipswithattendances(req, res, membershipandpayment, 'attendances', '_id.str', 'membershipandpayment_id.str', 'memberships', 'membership_id', '_id', membershipcallBack, { pub_key: req.params.pub_key })
}



function Mincalculate(from='',to=''){
  from=from.toString()
  to=to.toString()
from=new Date().setHours((from.split(':'))[0],(from.split(':'))[1],0)
to=new Date().setHours(to.split(':')[0],to.split(':')[1],0)
var min=Math.ceil((to-from)/(1000*60))
return min
}
function convertStringDate(date){
  try{
 var day=new Date(date).getFullYear()
  let m=(new Date(date).getMonth()+1)
   if((m/10)<1) m='0'+m
   day=day+'-'+m
   let d=(new Date(date).getDate())
   if((d/10)<1) d='0'+d
   day=day+'-'+d
   return day
  }
  catch{
  return  day=null
  }
}