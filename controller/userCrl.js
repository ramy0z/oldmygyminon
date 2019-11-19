var baseModel = require('../models/baseModel');
var user = require('../models/users/user');
var userMeta = require('../models/users/userMeta');
const email = require('./emailCrl');
const privilidge = require('./allprivilidgeCrl');
const options = require('./optionsCrl');
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var md5 = require('md5');
var attendance = require('./attendanceCrl');
var mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
var notifications = require('./notifications/notificationsCrl');
var auth = require('../models/auth/auth');
var log = require('./logCrl');

//create user
exports.createUser = function (req, res, callback1) {

  //generate private key and publick key
  var prime_length = 60;
  var diffHell = crypto.createDiffieHellman(prime_length);
  diffHell.generateKeys('base64');
  var pub_key = diffHell.getPublicKey('hex');
  var pri_key = diffHell.getPrivateKey('hex');
  //hash password
  if (typeof req.body.password != 'string') req.body.password = '';
  var password = crypto.pbkdf2Sync(req.body.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');

  //get user main data
  var data = {
    username: req.body.username,
    password: password,
    email: req.body.email,
    name: req.body.name,
    type: req.body.type,
    gender: req.body.gender,
    club_key: req.query.parent_key,
    branch_key: req.body.branch_key,
    units_key: req.body.units_key,
    units_type: req.body.units_type,
    pri_key: pri_key,
    pub_key: pub_key,
  }
  // call back function after user added
  var callback = function (obj, error) {
    if (error) callback1(obj, error);
    else {
      if (obj.type == 'account') req.body.parent_key = obj.pub_key;
      var body = req.body;
      for (var key in body) {
        var result = new Object();
        if (key == 'username' || key == 'password' || key == 'email' ||
          key == 'name' || key == 'type' || key == 'privilidge' || key == 'gender' || key == 'branch_key'
          || key == 'club_key' || key == 'units_type' || key == 'pri_key' || key == 'country', key == 'city')
          continue;
        result.key = key;
        result.value = body[key];
        result.pub_key = obj.pub_key;

        //  add new user
        var callback2 = function (result) { }
        baseModel.updateoradd(req, res, userMeta, result, result, callback2, true);
      }
      var addPriviliagescallback = function () { }
      privilidge.addDefalutPrivilidge(req, res, req.query.parent_key, obj.pub_key, addPriviliagescallback, true);
      callback1(obj, error);
    }
  }
  //add new users
  baseModel.add(req, res, user, data, callback, true);
}
//user regisert validation
exports.checkExistsMail = function (req, res, callback, pub_key = null) {
  if (pub_key == null) {
    var callback1 = function (result) {
      if (result.length) callback({ err: true, field: 'username', msg: 'username already exists' });
      else {
        var callback2 = function (result) {
          //console.log(result.length, result, req.body.email)
          if (result.length) callback({ err: true, field: 'email', msg: 'email already exists' });
          else callback({ err: false, field: '', msg: '' })
        }
        baseModel.get(req, res, user, { email: req.body.email }, {}, callback2);
      }
    }
    baseModel.get(req, res, user, { username: req.body.username }, {}, callback1, true);
  } else {
    var callback2 = function (result) {
      if (result.length && result[0].pub_key != pub_key) callback({ err: true, field: 'email', msg: 'email already exists' });
      else callback({ err: false, field: '', msg: '' })
    }
    baseModel.get(req, res, user, { email: req.body.email }, {}, callback2);
    //baseModel.get(req ,res,user,{email:req.body.email,pub_key:{ $nin: [req.query.public_key]}},{},callback2);
  }
}
//get all user
exports.getallusers = function (req, res, callback1, where) {
  var callback = function (result) {
    var userMap = new Array();
    var i = 1;
    result.forEach(function (user) {
      var data = new Object();
      data.increment = i;
      if (user._id) data._id = user._id; else data._id = '';
      if (user.username) data.username = user.username; else data.username = '';
      if (user.name) data.name = user.name; else data.name = '';
      if (user.email) data.email = user.email; else data.email = '';
      if (user.type) data.type = user.type; else data.type = '';
      if (user.pub_key) data.pub_key = user.pub_key; else data.pub_key = '';
      if (user.branch_key) data.branch_key = user.branch_key; else data.branch_key = '';
      if (user.createdat) data.createdat = user.createdat; else data.createdat = '';
      data.city = ''; data.addressLine = ''; data.postCode = ''; data.state = ''; data.twitter = '';
      data.linkedIn = ''; data.instagram = '';
      user.usermetas.forEach(function (usermeta) {
        if (usermeta.key == 'city') data.city = usermeta.value;
        if (usermeta.key == 'addressLine') data.addressLine = usermeta.value;
        if (usermeta.key == 'postCode') data.postCode = usermeta.value;
        if (usermeta.key == 'state') data.state = usermeta.value;
        if (usermeta.key == 'twitter') data.twitter = usermeta.value;
        if (usermeta.key == 'linkedIn') data.linkedIn = usermeta.value;
        if (usermeta.key == 'instagram') data.instagram = usermeta.value;
        if (usermeta.key == 'image_profile'){data.image_profile = usermeta.value}else{data.image_profile=''}
        if (usermeta.key == 'parent_key' && usermeta.value == req.query.parent_key) data.status = usermeta.status;
      });
      if (user.privilidgetypes.length) data.role = user.privilidgetypes[0].type;
      else data.role = '';
      data.havePrivilidge = false;
      user.allprivilidges.forEach(function (privilidge) {
        data.havePrivilidge = true;
        //return allPrivilidge
        if (data.havePrivilidge) {
          data.privilidge = { id: privilidge._id, privilidge: privilidge.privilidge, type_id: privilidge.type }
        }
      });

      //userMap[user._id] = user;
      userMap.push(data);
      i++;
    });
    callback1(userMap);
  }
  if (req.query.search) {
    var search = req.query.search.toString();
    where['$and'].push({
      $or: [
        { 'username': { '$regex': search } },
        { 'email': { '$regex': search } },
        { 'name': { '$regex': search } },
        { 'type': { '$regex': search } }
      ]
    });
  }
  //filter by status
  if (req.query.status) {
    var status = req.query.status.toString();
    where['$and'].push({ 'usermetas.value': req.query.parent_key, 'usermetas.key': 'parent_key', 'usermetas.status': status });
  }
  //filter by role
  if (req.query.role) {
    var role = req.query.role.toString();
    where['$and'].push({ 'privilidgetypes.type': role });
  }

  //filter by privilidge
  if (req.query.privilidge) {
    var privilidge = req.query.privilidge.toString().split(",");
    Object.values(privilidge).forEach(function (value) {
      where['$and'].push({ 'allprivilidges.privilidge': { '$regex': value } });
    });
  }

  //orderby
  //filter by privilidge
  if (req.query.orderby && req.query.order) {
    if (req.query.orderby == 'id') var sort = { _id: parseInt(req.query.order) }
    else if (req.query.orderby == 'username') var sort = { username: parseInt(req.query.order) }
    else if (req.query.orderby == 'name') var sort = { name: parseInt(req.query.order) }
    else if (req.query.orderby == 'email') var sort = { email: parseInt(req.query.order) }
    else if (req.query.orderby == 'role') var sort = { 'privilidgetypes.type': parseInt(req.query.order) }
    else var sort = { createdat: -1 };
  }
  baseModel.getJoin3(req, res, user, 'usermetas', 'pub_key', 'pub_key', 'allprivilidges', 'pub_key', 'key', 'privilidgetypes', 'allprivilidges.type', '_id', callback, where, true, sort);
}
//get all members
exports.getallmembers = function (req, res, callback1, where) {

  var callback = function (result) {
    var userMap = new Array();
    var i = 1;
    result.forEach(function (user) {
      var data = new Object();

      data.increment = i;
      if (user._id) data._id = user._id; else data._id = '';
      if (user.username) data.username = user.username; else data.username = '';
      if (user.name) data.name = user.name; else data.name = '';
      if (user.email) data.email = user.email; else data.email = '';
      if (user.status) data.status = user.status
      if (user.type) data.type = user.type; else data.type = '';
      if (user.gender) data.gender = user.gender; else data.gender = '';
      if (user.pub_key) data.pub_key = user.pub_key; else data.pub_key = '';
      if (user.branch_key) data.branch_key = user.branch_key; else data.branch_key = '';
      if (user.createdat) data.createdat = user.createdat; else data.createdat = '';
      data.city = ''; data.addressLine = ''; data.postCode = ''; data.state = ''; data.twitter = '';
      data.linkedIn = ''; data.instagram = '';
      user.usermetas.forEach(function (usermeta) {
        if (usermeta.key == 'city') data.city = usermeta.value;
        //  if (usermeta.key=='type') data.type = usermeta.value; 
      
        if (usermeta.status) data.status = usermeta.status

        if (usermeta.key == 'addressLine') data.addressLine = usermeta.value;
        if (usermeta.key == 'postCode') data.postCode = usermeta.value;
        if (usermeta.key == 'state') data.state = usermeta.value;
        if (usermeta.key == 'twitter') data.twitter = usermeta.value;
        if (usermeta.key == 'linkedIn') data.linkedIn = usermeta.value;
        if (usermeta.key == 'tagNumber') data.tagNumber = usermeta.value;
        if (usermeta.key == 'country') data.country = usermeta.value;
        if (usermeta.key == 'city') data.city = usermeta.value;
        //  if (usermeta.key == 'gender') data.gender = usermeta.value;
        if (usermeta.key == 'instagram') data.instagram = usermeta.value;
        if (usermeta.key == 'image_profile') data.image_profile = usermeta.value;
        if (usermeta.key == 'parent_key' && usermeta.value == req.query.parent_key) data.status = usermeta.status;
        if (usermeta.key == 'birthday') data.birthday = usermeta.value;
        if (usermeta.key == 'emergencyContact') data.emergencyContact = usermeta.value;
        if (usermeta.key == 'firstname' ) data.firstname = usermeta.value;
        if (usermeta.key == 'phone' ) data.phone = usermeta.value; 
        if (usermeta.key == 'lastname' ) data.lastname = usermeta.value;
        if (usermeta.key == 'zipCode' ) data.zipCode = usermeta.value;
      });
      //attendance
      data['cancelAttendance'] = 0
      data['completeAttendance'] = 0
      data['rescudalAttendance'] = 0
      data['pendingAttendance'] = 0

      user.attendances.forEach(function (attendance) {
        if (attendance.status == 'cancel') data['cancelAttendance'] += 1;
        else if (attendance.status == 'reschedual') data['rescudalAttendance'] += 1;
        else if (attendance.status == 'complete') data['completeAttendance'] += 1;
        else data['pendingAttendance'] += 1;
      });

      data['payment'] = 0;
      pendingScheduleMembership = []
      pendingPaymentMembership = []
      data['schedual_status'] = {};
      data['payment_status'] = {};
      user.membershipandpayments.forEach(function (membership) {
        if (membership.fees == undefined) membership.fees = 0;
        data['payment'] = data['payment'] + parseInt(membership.fees);
        if (membership.schedual_status == 'pending') {
          var memership_units_key = '';
          user.memberships.forEach(function (ships) {
            if (membership.membership_id.toString() == ships._id.toString()) memership_units_key = ships.units_key;
            else memership_units_key = 'fff';
          });
          pendingScheduleMembership.push({ membership_id: membership.membership_id, se_id: membership._id, units_key: memership_units_key, date: new Date(membership.start_date).getTime() })
        }
        if (membership.payment_status == 'pending') {
          pendingPaymentMembership.push(membership._id)
        }
      });
      data['memberships_number'] = user.membershipandpayments.length;
      if (pendingPaymentMembership.length == 1) {
        data['payment_status'] = { 'number': '1', 'membership_id': pendingPaymentMembership[0] }
      }
      else {
        data['payment_status'] = { 'number': pendingPaymentMembership.length, 'membership_id': '' }
      }
      if (pendingScheduleMembership.length == 1) {
        data['schedual_status'] = { 'number': '1', 'membership_id': pendingScheduleMembership[0] }
      }
      else {
        data['schedual_status'] = { 'number': pendingScheduleMembership.length, 'membership_id': '' }
      }
      //userMap[user._id] = user;
      userMap.push(data);
      i++;

    });
    //console.log(userMap,where);
    callback1(userMap);
  }
  if (req.query.search) {
    var search = req.query.search.toString();
    where['$and'].push({
      $or: [
        { 'username': { '$regex': search } },
        { 'email': { '$regex': search } },
        { 'name': { '$regex': search } },
        { 'type': { '$regex': search } }
      ]
    });
  }
  //filter by status
  if (req.query.status) {
    var status = req.query.status.toString();
    where['$and'].push({ 'usermetas.value': req.query.parent_key, 'usermetas.key': 'parent_key', 'usermetas.status': status });
  }
  //filter by status
  if (req.query.gender) {
    var gender = req.query.gender.toString();
    where['$and'].push({ gender });
  }
  //filter by status
  if (req.query.type) {
    var type = req.query.type.toString();
    where['$and'].push({ 'memberships.type': type });
  }
  //filter by status
  if (req.query.payment) {
    var payment = req.query.payment.toString();
    where['$and'].push({ 'membershipandpayments.payment_status': payment });
  }

  //orderby
  //filter by privilidge
  if (req.query.orderby && req.query.order) {
    if (req.query.orderby == 'id') var sort = { _id: parseInt(req.query.order) }
    else if (req.query.orderby == 'username') var sort = { username: parseInt(req.query.order) }
    else if (req.query.orderby == 'name') var sort = { name: parseInt(req.query.order) }
    else if (req.query.orderby == 'email') var sort = { email: parseInt(req.query.order) }
    else if (req.query.orderby == 'gender') var sort = { gender: parseInt(req.query.order) }
    else if (req.query.orderby == 'status') var sort = { status: parseInt(req.query.order) }
    else if (req.query.orderby == 'type') var sort = { 'memberships.type': parseInt(req.query.order) }
    else var sort = { createdat: -1 };
  }

  baseModel.getJoin4(req, res, user, 'usermetas', 'pub_key', 'pub_key', 'membershipandpayments', 'pub_key', 'pub_key', 'memberships', 'membershipandpayments.membership_id', '_id', 'attendances', 'membershipandpayments._id', 'membershipandpayment_id', callback, where, true, sort);
}


exports.GetUserByPrivlidgeTypeId = function (req, res, roles_ids, callback) {
  var getuserscallback = function (data) {
    var users = new Array();
    Object.values(data).forEach(function (user) {
      users.push(user['pub_key']);
    });
    callback(users);
  }

  var objectRolesId = new Array()
  Object.keys(roles_ids).forEach(function (role) {
    objectRolesId.push(ObjectId(roles_ids[role]));
  });

  where = {
    $or: [
      { branch_key: req.query.parent_key },
      { club_key: req.query.parent_key },
      { pub_key: { $nin: [req.query.parent_key, req.query.public_key] }, 'usermetas.value': req.query.parent_key, 'usermetas.key': 'parent_key' }
    ], $and: [{ 'usermetas.value': 'staff', 'usermetas.key': 'user_type' }, { 'allprivilidges.type': { $in: objectRolesId } }]
  }

  baseModel.getJoin2(req, res, user, 'usermetas', 'pub_key', 'pub_key', 'allprivilidges', 'key', 'pub_key', getuserscallback, where, true);
}
//get club tree
exports.getClubTree = function (req, res, callback1) {
  var callback = function (result) {
    var response = new Array();
    Object.values(result).forEach(function (branchs) {
      var allunits = new Array();
      if (branchs.type == 'branch') {
        Object.values(result).forEach(function (units) {
          if (units.type == 'units' && units.branch_key == branchs.pub_key) {
            if (units.units_key) var parent = units.units_key; else var parent = '';
            allunit = { _id: units._id, pub_key: units.pub_key, parent, name: units.name, resources: [], units: [] }
            Object.values(units.unitresources).forEach(function (resource) {
              if (units.pub_key == resource.units_key)
                allunit.resources.push({ _id: resource._id, name: resource.title })
            });
            allunits.push(allunit);
          }
        });
        //rearang units parent
        Object.keys(allunits).forEach(function (key) {
          if (allunits[key] != undefined) {
            if (allunits[key].parent != '') {
              Object.keys(allunits).forEach(function (comparekey) {
                if (allunits[comparekey] != undefined) {
                  if (allunits[comparekey].pub_key == allunits[key].parent) {
                    allunits[comparekey]['units'].push(allunits[key]);
                    allunits.splice(allunits.indexOf(allunits[key]), 1);
                  } else if (allunits[comparekey]['units'].length) {
                    Object.keys(allunits[comparekey]['units']).forEach(function (lastkey) {
                      if (allunits[comparekey]['units'][lastkey] != undefined) {
                        if (allunits[comparekey]['units'][lastkey].public_key == allunits[key].parent) {
                          allunits[comparekey]['units'][lastkey]['units'].push(allunits[key]);
                          allunits.splice(allunits.indexOf(allunits[key]), 1);
                        } else if (allunits[comparekey]['units'][lastkey]['units'].length) {
                          Object.keys(allunits[comparekey]['units'][lastkey]['units']).forEach(function (lastkey1) {
                            if (allunits[comparekey]['units'][lastkey]['units'][lastkey1].public_key == allunits[key].parent) {
                              allunits[comparekey]['units'][lastkey]['units'][lastkey1]['units'].push(allunits[key]);
                              allunits.splice(allunits.indexOf(allunits[key]), 1);
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });

        response.push({ _id: branchs._id, pub_key: branchs.pub_key, name: branchs.name, units: allunits });
      }
    });
    callback1(response);
  }
  var where = { $or: [{ branch_key: req.query.parent_key }, { club_key: req.query.parent_key }] }
  baseModel.getJoin(req, res, user, 'unitresources', 'club_key', 'club_key', callback, where, true);
}

exports.asyncget = async function (req, res, where, select) {
  return await baseModel.ascynget(req, res, user, where, select, true);
}
//user login
exports.login = function (req, res, callback) {
  var privilidge = new Array(); var allPrivilidge = new Array();
  var callback1 = function (data) {
 
    if (data.length != 0) {
      const accessToken = jwt.sign({ id: data[0]._id }, req.app.get('jwt.secret'), {
        issuer: req.app.get('jwt.issuer'),
        audience: req.app.get('jwt.audience')
      });
      delete data[0].password; delete data[0].pri_key; delete data[0].createdat;; delete data[0].__v;
      var usermetas = data[0].usermetas;

      //get all subscribe keys
      for (var key in usermetas) {
        if (usermetas.hasOwnProperty(key)) {
          if (usermetas[key].key == 'parent_key') {
            //get gym name
            allPrivilidge.push(usermetas[key].value);

          } else { data[0][usermetas[key].key] = usermetas[key].value; }
        }
      }
      //get club name of all keys
      var usermetascallback = function (obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key].value) privilidge.push({ key: obj[key].pub_key, name: obj[key].value });
          }
        }
       if(data[0]['allprivilidges'].length>0)
       {
         
        data[0].allPrivilidge=JSON.parse(data[0]['allprivilidges'][0].privilidge)
        delete data[0].allprivilidges
       }
        delete data[0].usermetas;
        data[0].acounts = privilidge;
        data[0].token = accessToken;

        callback(true, data[0]);
      }
      var club_name = gitusermeta(req, res, 'club_name', allPrivilidge, usermetascallback);
    } else {
      callback(false, {});
    }
  }
  if (typeof req.body.password != 'string') req.body.password = '';
  var where = {}

  if (req.body.username && req.body.password) {
    if (/\S+@\S+\.\S+/.test(req.body.username)) where.email = req.body.username
    else where.username = req.body.username
    var password = crypto.pbkdf2Sync(req.body.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');


    if (req.body.password) where.password = password
    //console.log(where)
    baseModel.getJoin2(req, res, user, 'usermetas', 'pub_key', 'pub_key','allprivilidges','pub_key','key', callback1, where, true, sort = { createdat: -1 }, limit = 1);
  }
  else callback(false, {});
}
//get user profile data
exports.getUserData = function (req, res, callback, parent_key = false) {
  var callback1 = function (obj) {
    if (typeof obj[0] != 'undefined') {
      delete obj[0].password; delete obj[0].pri_key; delete obj[0].createdat; delete obj[0].__v;
      var usermetas = obj[0].usermetas;
      var allPrivilidge = new Array();
      for (var key in usermetas) {
        if (usermetas.hasOwnProperty(key)) {
          if (usermetas[key].key == 'parent_key') {
            allPrivilidge.push({ key: usermetas[key].value })
            if (usermetas[key].pub_key == usermetas[key].value) obj[0].type = 'xadmin';
          } else { obj[0][usermetas[key].key] = usermetas[key].value; }
        }
      }
      delete obj[0].usermetas;
      obj = obj[0];
    }
    callback(obj);
  }
  if (parent_key) var key = req.body.key; else var key = req.query.public_key;
  baseModel.getJoin(req, res, user, 'usermetas', 'pub_key', 'pub_key', callback1, { pub_key: key }, true);
}
//get Branch data
exports.getBranchData = function (req, res, callback, parent_key = false) {
  var callback1 = function (obj) {
    if (typeof obj[0] != 'undefined') {
      delete obj[0].password; delete obj[0].pri_key; delete obj[0].createdat; delete obj[0].__v;
      var result = {
        'id': obj[0]._id,
        'name': obj[0].name,
        'email': obj[0].email,
        'username': obj[0].username,
        'pub_key': obj[0].pub_key,
        'Adress': '',
        'lat': '',
        'lang': '',
        'brief': ''
      }
      Object.values(obj[0].usermetas).forEach(function (meta) {
        if (meta.key == 'Adress') result['Adress'] = meta.value;
        if (meta.key == 'lat') result['lat'] = meta.value;
        if (meta.key == 'lang') result['lang'] = meta.value;
        if (meta.key == 'brief') result['brief'] = meta.value;
      });
      var obj = result;
    }
    callback(obj);
  }
  var where = { pub_key: req.params.branch_key, club_key: req.query.parent_key, type: 'branch' };
  baseModel.getJoin(req, res, user, 'usermetas', 'pub_key', 'pub_key', callback1, where, true);
}
//get Units data
exports.getUnitsData = function (req, res, callback, parent_key = false) {
  var callback1 = function (obj) {
    if (typeof obj[0] != 'undefined') {
      delete obj[0].password; delete obj[0].pri_key; delete obj[0].createdat; delete obj[0].__v;
      var result = {
        'id': obj[0]._id,
        'name': obj[0].name,
        'email': obj[0].email,
        'username': obj[0].username,
        'pub_key': obj[0].pub_key,
        'branch_key': obj[0].branch_key,
        'Adress': '',
        'lat': '',
        'lang': '',
        'brief': '',
        'working_hour': ''
      }
      Object.values(obj[0].usermetas).forEach(function (meta) {
        if (meta.key == 'Adress') result['Adress'] = meta.value;
        if (meta.key == 'lat') result['lat'] = meta.value;
        if (meta.key == 'lang') result['lang'] = meta.value;
        if (meta.key == 'brief') result['brief'] = meta.value;
        if (meta.key == 'working_hour') result['working_hour'] = meta.value;
      });
      var obj = result;
    }
    callback(obj);
  }
  var where = { pub_key: req.params.units_key, club_key: req.query.parent_key, type: 'units' };
  baseModel.getJoin(req, res, user, 'usermetas', 'pub_key', 'pub_key', callback1, where, true);
}
//get user profile data
exports.getUserByPublickeys = function (req, res, where, callback) {
  var callback1 = function (obj) {
    callback(obj);
  }
  baseModel.getJoin(req, res, user, 'usermetas', 'pub_key', 'pub_key', callback1, where, true);
}
//update user data
exports.updateUserData = function (req, res, callback) {
  var callback1 = function (obj) {
    var body = req.body;
    for (var key in body) {
      var result = new Object();
      if (key == 'username' || key == 'password' || key == 'pub_key' || key == 'email' || key == 'name' || key == 'branch_key'
        || key == 'club_key' || key == 'units_type' || key == 'gender')
        continue;
      // if(req.body.pub_key) var where = {pub_key:req.body.pub_key,key:key}
      // else var where = {pub_key:req.query.public_key,key:key}
      var where = { pub_key: req.params.pub_key, key: key }
      var data = { pub_key: req.params.pub_key, key: key, value: body[key] }
      //  add new user
      var callback2 = function (result) { }
      //console.log(typeof key, key, typeof body[key]);
      if (typeof key == 'string' && typeof body[key] == 'string')
        baseModel.updateoradd(req, res, userMeta, where, data, callback2, true);
    }
    callback(true);
  }
  var data = {}
  if (req.body.username) data.username = req.body.username
  if (req.body.email) data.email = req.body.email
  // var data = {  username : req.body.username,email : req.body.email }
  // if(req.body.pub_key) var where = {pub_key:req.body.pub_key}
  // else var where = {pub_key:req.query.public_key}
  var where = { pub_key: req.params.pub_key }
  baseModel.update(req, res, user, where, data, callback1, false, true);
}

var gitusermeta = function (req, res, keyword, pub_key, callback1) {
  var callback = function (obj) {
    callback1(obj);
  }
  baseModel.get(req, res, userMeta, { key: keyword, pub_key: { $in: pub_key } }, {}, callback);
}

exports.updateusermeta = function (req, res, keyword, data, callback1) {
  var callback = function (obj) {
    var callback2 = function (obj) {
      callback1(obj);
    }
    if (obj.length) {
      baseModel.update(req, res, userMeta, { _id: obj[0]._id }, { value: data }, callback2, false, true);
    } else {
      var data1 = { pub_key: req.query.public_key, key: keyword, value: data, status: true }
      baseModel.add(req, res, userMeta, data1, callback2, false, true);
    }
  }
  baseModel.get(req, res, userMeta, { key: keyword, pub_key: req.query.public_key }, {}, callback);
}
// user regisert validation
//delete user
exports.deleteUserData = function (req, res, where, callback) {
  var callback1 = function (obj) {
    callback(obj);
  }
  baseModel.delete(req, res, user, where, callback1, false, true);
}
//add users to club
exports.upgradetoclub = function (req, res, callback1) {
  var data = [
    { pub_key: req.query.public_key, key: 'parent_key', value: req.query.public_key, club_pub_key: req.query.public_key, status: true },
    { pub_key: req.query.public_key, key: 'address', value: req.body.address, club_pub_key: req.query.public_key, status: true },
    { pub_key: req.query.public_key, key: 'club_name', value: req.body.club_name, club_pub_key: req.query.public_key, status: true },
    { pub_key: req.query.public_key, key: 'phone', value: req.body.phone, club_pub_key: req.query.public_key, status: true },
  ]
  // call back function after user added
  var callback = function (obj, error) { callback1(obj) }
  //add new users
  baseModel.addmany(req, res, userMeta, data, callback, true);
}
//subscribe club
exports.subscribetoclub = function (req, res, callback1) {
  var getusercallback = function (users) {

    if (typeof users[0] === 'undefined') {
      var callbackoption = function (getoption) {
        //check if Club Open Subscribetion
        if (getoption.subscribeByUser === 'true') {
          if (getoption.approveAfterSubscribe === 'true') var status = 'Deactive'; else var status = 'Active';
          var data = [{ pub_key: req.query.public_key, key: 'parent_key', value: req.params.id, status: status },
          { pub_key: req.query.public_key, key: 'user_type', value: 'member', status: 'true' }]
          var callback = function (obj, error) {
            ref_id = req.query.public_key; // log the refrance id of the user row information
            pref_id = ''; // no parent refrance id 
            // add log renew package(req, res,'action','table','log_key_state','ref_id','pref_id');
            log.add(req, res, 'subscribetoclub', 'usermetas', 'new_subscribe', ref_id, pref_id);

            var emailcallback = function () { }
            //user email
            email.sendemail(req, res, '', 'Subscribe To Club', 'User Subscribe', req.query.public_key, emailcallback);
            //club mail
            email.sendemail(req, res, '', 'New User is subscribed', 'Club Admin Notification', req.params.id, emailcallback);
            callback1(obj, '');
          }
          //add new users
          baseModel.addmany(req, res, userMeta, data, callback, true);
        } else callback1(false, 'You Cant Subscribe To this Club');
      }
      var where = { pub_key: req.params.id, key: { $in: ["subscribeByUser", "approveAfterSubscribe"] } };
      var select = { key: 1, value: 1, _id: 0 };
      options.getOption(req, res, where, select, callbackoption);
    } else callback1(false, 'You already In This Club');
  }
  //check if users already subscribe
  var where = { pub_key: req.query.public_key, key: 'parent_key', value: req.params.id }
  baseModel.get(req, res, userMeta, where, {}, getusercallback);
}
// user regisert validation
exports.unsubscribetoclub = function (req, res, callback1) {
  var data = { pub_key: req.params.id, key: 'parent_key', value: req.query.parent_key }
  var callback = function (obj, error) { callback1(obj) }
  baseModel.delete(req, res, userMeta, data, callback, false, true)
}
// user regisert validation
exports.activeAndDeactiveUser = function (req, res, callback1) {

  var data = { pub_key: { $in: req.body.ids }, key: 'parent_key', value: req.query.parent_key }
  var callback = function (obj, error) { callback1(obj) }
  baseModel.update(req, res, userMeta, data, { status: req.body.status }, callback, true, true);
}
//invite user to club
exports.inviteToClub = function (req, res, callback) {

  var club_key = req.body.invitation_key;
  if (club_key != 'null' && club_key != undefined && club_key != 'branch' && club_key != 'units')
    var key = req.body.invitation_key; else var key = req.query.parent_key;
  var checkUserExistsCallback = function (obj) {
    if (typeof obj[0] === 'undefined') {
      var checkEmailIsSendCallback = function (result) {
        if (typeof result[0] === 'undefined') {
          if (club_key == 'branch' || club_key == 'units') var all = club_key; else var all = 'none';
          var sendEmailCallback = function (result) {
            if (result) {
              var addEmailCallback = function (result) { }
              email.addEmail(req, res, key, req.body.email, 'invitation', all, req.body.user_type, addEmailCallback);
              callback('done');
            } else callback('error');
          }
          var currentDate = Math.round(new Date().getTime() / 1000);
          var createSignature = md5(md5('gyminAppwsds5' + key + req.body.email + currentDate + req.body.user_type + all + '@#!$$#@#$844%^^&(SD'));
          var link = 'http://'+req.get('host')+'/auth/emailinvitationlink/' + key + '/' + req.body.email + '/' + currentDate + '/' + createSignature + '/' + req.body.user_type + '/' + all;
          console.log(link);
          email.sendemail(req, res, req.body.email, 'Invite To club', 'Please Click ' + link, '', sendEmailCallback);
        } else callback('email send before');
      }
      //check if email send before
      email.getEmail(req, res, checkEmailIsSendCallback);
    } else callback('userexists');
  }
  //check if users exists
  var where = { key: 'parent_key', 'users.email': req.body.email, value: key }
  baseModel.getJoin(req, res, userMeta, 'users', 'pub_key', 'pub_key', checkUserExistsCallback, where);
}
//re invite user to club
exports.resendInviteToClub = function (req, res, callback) {
  var getemailcallback = function (obj) {
    if (obj[0] != 'undefined') {
      var callback3 = function (result) {
        if (result) {
          var callback4 = function (result) { }
          email.updateEmail(req, res, { _id: req.params.id }, { createdat: new Date(), status: 'pending' }, callback4);
          callback('done');
        } else callback('error');
      }
      var currentDate = Math.round(new Date().getTime() / 1000);
      if (obj[0].all == undefined || obj[0].all == '') var all = 'none'; else var all = obj[0].all;
      var createSignature = md5(md5('gyminAppwsds5' + obj[0].from + obj[0].to + currentDate + obj[0].user_type + all + '@#!$$#@#$844%^^&(SD'));
      var link = 'http://'+req.get('host')+'/auth/emailinvitationlink/' + obj[0].from + '/' + obj[0].to + '/' + currentDate + '/' + createSignature + obj[0].user_type + all;
      //console.log(link);
      email.sendemail(req, res, obj[0].to, 'Invite To club', 'Please Click ' + link, '', callback3);
    } else callback('error');
  }
  email.getEmailById(req, res, req.params.id, getemailcallback);
}
//re voke user to club
exports.revokeInviteToClub = function (req, res, callback) {
  var getemailcallback = function (obj) {
    if (obj[0] != 'undefined') {
      var callback4 = function (result) { }
      email.updateEmail(req, res, { _id: req.params.id }, { status: 'revoked' }, callback4);
      callback('done');
    } else callback('error');
  }
  email.getEmailById(req, res, req.params.id, getemailcallback);
}
//check invite user to club
exports.checkInvitationLink = function (req, res, callback) {

  //make signature to compare link encription
  if (req.params.all) var all = req.params.all; else var all = 'none';
  var createSignature = md5(md5('gyminAppwsds5' + req.params.parent_key + req.params.email + req.params.timestamp + req.params.user_type + all + '@#!$$#@#$844%^^&(SD'));
  //console.log(createSignature);
  if (createSignature === req.params.signature) {
    var invitationcallback = function (invitation) {
      if (typeof invitation[0] != 'undefined') {
        var callback1 = function (result) {
          if (typeof result[0] != 'undefined') {
            var callback2 = function (checkadd, error) {
              if (typeof checkadd[0] === 'undefined') {
                //send emails and update email status
                var callback3 = function (obj, error) {
                  if (obj) {
                    var addPriviliagescallback = function () { }
                    privilidge.addDefalutPrivilidge(req, res, req.params.parent_key, result[0].pub_key, addPriviliagescallback);

                    var callback4 = function () { }
                    email.sendemail(req, res, '', 'New User ' + result[0].name + ' Accept YOUR Invitation', 'Club Admin Notification', req.params.parent_key, callback4);

                    var emaildata = { from: req.params.parent_key, to: req.params.email, reason: 'invitation' }
                    email.updateEmail(req, res, emaildata, { status: 'approved' }, callback4);

                    //save tranaction
                    auth.handelTransaction(req, res, req.params.parent_key, 'newSubscribe', 0);

                    var notificationData = '{"user_key":"' + result[0]["pub_key"] + '","user_type":"' + req.params.user_type + '"}';
                    if (req.params.user_type == 'member') { var title = 'New Member is subscribed'; var body = 'New Member Subscribe' }
                    else { var title = 'New Staff is subscribed'; var body = 'New Staff is subscribed' }
                    notifications.sendToTopic(req, res, req.params.parent_key + '_newSubscriptionNotification', callback4, notificationData, title, body, '', '');

                    callback('done');
                  } else callback('invite error');
                }
                //check if email send to all brach or all units
                if (all == 'units' || all == 'branch') {
                  var branchcallback = function (branchcresult) {
                    if (branchcresult[0] != 'undefined') {
                      var usermetadata = new Array();
                      branchcresult.forEach(function (user) {
                        usermetadata.push({ pub_key: result[0].pub_key, key: 'parent_key', value: user.pub_key, status: 'Active' });
                      });
                      usermetadata.push({ pub_key: result[0].pub_key, key: 'user_type', value: req.params.user_type, status: 'true' });
                      baseModel.addmany(req, res, userMeta, usermetadata, callback3, true);
                    } else callback('addbefore');
                  }
                  baseModel.get(req, res, user, { club_key: req.params.parent_key, type: all }, {}, branchcallback);
                }//if email send to club
                else {
                  var usermetadata = [{ pub_key: result[0].pub_key, key: 'parent_key', value: req.params.parent_key, status: 'Active' },
                  { pub_key: result[0].pub_key, key: 'user_type', value: req.params.user_type, status: 'true' }]

                  baseModel.addmany(req, res, userMeta, usermetadata, callback3, true);
                }
              } else callback('addbefore');
            }
            //check if user add before
            var data = { pub_key: result[0].pub_key, key: 'parent_key', value: req.params.parent_key, status: 'approved' }
            baseModel.get(req, res, userMeta, data, {}, callback2);
          } else callback('emailNotExists');
        }
        //get user by email
        baseModel.get(req, res, user, { email: req.params.email }, {}, callback1);
      } else callback('linkexpired');
    }
    //check if invitation Not delete
    email.getEmailByWhere(req, res, { from: req.params.parent_key, to: req.params.email, reason: 'invitation', status: 'pending' }, invitationcallback);
  } else callback('linkexpired');
}


exports.getUserBybranch = function (req, res, callback) {
  var callback1 = function (result) {
    if (result && result.length > 0) {
      result.forEach(element => {
        if (element.units && element.units.length > 0) {
          elmemnt.units.forEach(elem => {
            //console.log(elem)
          });
        }
      })
    }
  }
  this.getClubTree(req, res, callback1)
}


//register for member 
exports.registerMember = function (req, res, callback) {
  //check required parameter
  
  reqiredParams = ['Username', 'Password', 'Email', 'Type', 'Gender', 'Firstname', 'LastName', 'BirthDay','Phone']
  notRetriveparams = []
  reqiredParams.forEach(elem => {
    if (!req.body[`${elem.toLowerCase()}`]) {
      notRetriveparams.push(elem)
    }
  })
 
  if (notRetriveparams.length) {
    var msg = ''
    notRetriveparams.forEach((elem, index) => {

      msg += elem + ' , '
      if (index == notRetriveparams.length - 2) {
        msg = msg.slice(0, -2);
        msg += 'and '
      }
    })
    console.log(msg)
    msg = msg.slice(0, -2);
    if (notRetriveparams.length == 1) msg = msg + 'is required'
    else msg = msg + 'are required'
    callback({ result: false, data: msg })

  }
  //validate email
  else if (!/\S+@\S+\.\S+/.test(req.body.email))
    callback({ result: 'false', data: 'Invalid email format' })
  else if(!((req.body.phone).toString().match(/^\d{11}$/)))
  callback({ result: 'false', data: 'Invalid phone number' })

  else {
    //check existing email or username
    var existMailCallback = function (result) {
      if (result.err == true) {
        if (result['field'] == 'username')
          callback({ result: 'false', data: 'Username already exists' })
        else if (result['field'] == 'email')
          callback({ result: 'false', data: 'Email already exists' })
        else
          callback({ result: 'false', data: 'Username and Email already exists' })
      }
      //check password
      else {

        if (req.body.password.length >= 8) {
          var password = crypto.pbkdf2Sync(req.body.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');
          var prime_length = 60;
          var diffHell = crypto.createDiffieHellman(prime_length);
          diffHell.generateKeys('base64');
          var pub_key = diffHell.getPublicKey('hex');
          var pri_key = diffHell.getPrivateKey('hex');
          var registerCallback = function (result) {
            console.log('m', result)
            if (result._id) {
              const accessToken = jwt.sign({ id: result._id }, req.app.get('jwt.secret'), {
                issuer: req.app.get('jwt.issuer'),
                audience: req.app.get('jwt.audience')
              });

      
         //user table data
             var data = { token: accessToken, 
                'username': result.username,
                 'email': result.email, 
                 '_id': result._id,
                  'pub_key': pub_key, 
                  'name': result.name, 
                  'status': result.status, 
                  'gender': result.gender }
              var registerCallback1 = function (resu) {
                //usermeta data
                //console.log('rse',resu)
                if (resu.length>0){
                resu.forEach(elem=>{
                  data[elem.key]=elem.value
                })
                callback({ 'result': true, 'data': data })
             
               //mail callback 
                var mailcallback=function(result)
                {
                  if(result)
                  {                  
                  email.confrmmailcode(req,res,{'pub_key':pub_key,'confirmcode':rand,'submission':3},(res)=>{
                   console.log(result)
                  })
                  }
                }
                  //body of mail confirmation 
                  let rand=CreateRand()
                  let  link="http://"+req.get('host')+"/api/member/v1/auth/verify?id="+rand+"&pub_key="+pub_key;
                  var body="<h1>Thank you to join GYMIN family</h1> <br/> Confirm code :"+rand+" <br>You can also  confirm from this link :"+link+" </h1>"
            
                  email.sendemail(req,res,data.email,'confirm',body,'',mailcallback)
              }
                else
                  callback({ 'result': false, 'data': 'Sorry,May be error ocurred .try again' })

              }
              usermetavalue=[]
             var usermeta=['birthday','lastname','firstname','phone','tagNumber','country','city','zipCode','emergencyContact', 'image_profile']
             usermeta.forEach(elem=>{
               if(req.body[elem])
              usermetavalue.push({'pub_key': pub_key,key:elem,value:req.body[elem]})
              else if(elem=='emergencyContact')
              usermetavalue.push({'pub_key': pub_key,key:elem,value:[{'emailAddress':'','relationship':'','medicalCase':''}]})
              else
              usermetavalue.push({'pub_key': pub_key,key:elem,value:''})
               
              })
              //console.log('data',data)
              baseModel.addmany(req, res, userMeta, usermetavalue, registerCallback1)
            }
            else {
              callback({ 'result': false, 'data': 'Sorry,May be error ocurred .try again' })
            }
          }

          baseModel.add(req, res, user, { 'pub_key': pub_key, 'pri_key': pri_key, 'email': req.body.email, 'password': password, 'username': req.body.username, 'gender': req.body.gender, 'type': req.body.type, name: req.body.name }, registerCallback)
        }
        else {
          callback({ result: 'false', data: 'Password  at least 8' })
        }
      }
    }
    this.checkExistsMail(req, res, existMailCallback)


  }
}



//update member data 
exports.updateMemberData = function (req, res, callback) {
  if(req.body.image_profile)req.body.image_profile = req.body.image_profile.split(auth.siteurl())[1];
  if (req.body.username || req.body.email) {
    this.checkExistsMail(req, res, (result) => {
      if (result['err'] == true) {
        if (result['field'] == 'username')
          callback({ result: 'false', data: 'Username already exists' })
        else if (result['field'] == 'email')
          callback({ result: 'false', data: 'Email already exists' })
        else
          callback({ result: 'false', data: 'Username and Email already exists' })

      }
      else {
        this.updateUserData(req, res, (result) => {
          if (result) {
            var callbackdata = function (resu) {
              callback(resu)
            }
            updateData(req, res, callbackdata);
          }
          else {
            callback({ 'result': false, 'data': 'Sorry,Data update failed. try again' })
          }
        })
      }
    })

  }
  else {
    var callbackdata = function (resu) {
      callback(resu)
    }
    updateData(req, res, callbackdata);
  }


}
var updateData = (req, res, callback) => {
  // console.log(req.body)
  baseModel.get(req, res, userMeta, { pub_key: req.params.pub_key }, {}, (res) => {
    var updatedData = []
    var insertedData = []
    var sendedData = []
    Object.keys(req.body).forEach(elem => {
      if (elem == 'username' || elem == 'email' || elem == 'password') { }
      else if(elem=='gender')
      {
        baseModel.update(req,res,user,{'pub_key': req.params.pub_key },{gender:req.body[elem]},(res)=>{
          
        })
      }
      else
        sendedData.push(elem)
    })
    res.forEach(elem => {
      key = elem['key']
      var index = sendedData.indexOf(key);
      if (index != -1)
        sendedData.splice(index, 1);
      if (req.body[key])
        updatedData.push({ 'key': { 'pub_key': req.params.pub_key, 'key': key }, 'value': { 'value': req.body[key] } })
    })
    sendedData.forEach(elem => {
      insertedData.push({ 'key': elem, 'value': req.body[elem], 'pub_key': req.params.pub_key })

    })
    //console.log(insertedData)
    //console.log(updatedData)
    if (updatedData.length > 0)
      baseModel.updateManyDataInTheSameTime(req, res, userMeta, updatedData, (result) => {
        if (result['result']['nMatched'] == updatedData.length) {
        }
        else {
          callback({ 'result': false, 'data': 'Sorry,Data update failed. try again' })
        }
      })
    if (sendedData.length > 0) {
      var callbackInsertedData = function (result) {
        //console.log(result)
      }
      baseModel.insertManyDataInTheSameTime(req, res, userMeta, insertedData, callbackInsertedData)
    }
    var callback1 = function (result) {
      if (result.length) {
        callback({ 'result': true, 'data': result })
      }
      else {
        callback({ 'result': false, 'data': 'Sorry,Data update failed. try again' })
      }

    }
    this.getallmembers(req, res, callback1, { 'pub_key': req.params.pub_key })
  })
}
// var updateWallet=async function (req) {
//   //console.log(req.params.pub_key)
//   const session = await userMeta.startSession();

//  /// console.log(session)
//   session.startTransaction();
//   try {
//     const opts = { session };
//   await userMeta.findOneAndUpdate(
//                     { 'pub_key': req.params.pub_key
//                    }, opts);

//   await userMeta(
//                     { 'pub_key': req.params.pub_key, 'key': 'name', value: "maiiii" })
//                     .save(opts);

//     await session.commitTransaction();
//     console.log(session)
//     session.endSession();
//     return true;
//   } catch (error) {
//     console.log(error)
//     // If an error occurred, abort the whole transaction and
//     // undo any changes that might have happened
//     await session.abortTransaction();
//     session.endSession();
//     throw error; 
//   }
// }
exports.getDataOfAccountsBypubKeyarr = function (req, res, where, callback, groupBy = null) {
  var callback1 = function (resu) {
    callback(resu)
  }
  baseModel.getwithgroup(req, res, userMeta, where, callback1, 'pub_key')
}

function CreateRand()
{
  let x=Math.floor((Math.random() * 100))
  x=x.toString()
  while (x.length!=4) {
    x=x+Math.floor((Math.random() * 100))
  }
  return x
}



exports.userbyPub_key = function (req, res,callback) {
  var callback1 = function (resu) {
    callback(resu)
  }
  baseModel.get(req, res,user,{pub_key:req.query.pub_key},{},callback1)
}