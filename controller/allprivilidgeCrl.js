var baseModel = require('../models/baseModel');
var usersPrivilidge = require('../models/users/allPrivilidge');
var users = require('./userCrl');
var privilidgetypes = require('./privilidgeTypeCrl');
var notification = require('./notifications/notificationsCrl');
var log = require('./logCrl');


exports.getUsersPrivilidge = function (req, res, callback, where = null) {
  global.where = where;
  var callback2 = function (obj2, error) {
   
   // if (typeof obj2[0] != 'undefined') var string1 = obj2[0].privilidge; else var string1 = '';
    // for (var group in allPrivilidges) {
    //   if (allPrivilidges.hasOwnProperty(group)) {
    //     var deletegrop = true;
    //     Object.keys(allPrivilidges[group]).forEach(function (key) {
    //       deletegrop = false;
    //       if (!string1.includes(allPrivilidges[group][key])) delete allPrivilidges[group][key];
    //     });
    //     if (deletegrop) delete allPrivilidges[group];
    //   }
    // }
   let privilidge={}
    if(obj2.length>0){
      privilidge=JSON.parse(obj2[0].privilidge)
    }
    console.log(privilidge)
    callback(privilidge, false);
  }

  if (global.where == null) {
    if (req.body.key) var key = req.body.key; else var key = req.query.public_key;
    var where = { $or: [{ parent_key: req.query.parent_key }, { admin_key: req.query.parent_key }], key: key }
  } else where = global.where;

  baseModel.getwithoutpagenation(req, res, usersPrivilidge, where, {}, callback2);
}

exports.addUsersPrivilidge = function (req, res, callback, account = false) {
  console.log(req.body)
  var userDataCallBack = function (user) {
    var callback1 = function (obj, error) {
      if (error) callback(obj, error);
      else callback(obj, false);

    }
    if (user.type == 'xsa' || user.type == 'xadmin' || user.type == 'units' || user.type == 'branch') var parent_key = req.body.key;
    else var parent_key = req.query.parent_key;

    if (req.body.type == '' || req.body.type == 'undefined' || req.body.type == null) req.body.type = '5c5ee0444e44ee1054e26a89';
 if(req.body.privilidge&&req.body.privilidge.length>0)
 {
    var privilidge = preparePermission(req.body.privilidge)

     if (typeof privilidge=='string'&&privilidge.length>0) {
      var data = { parent_key: parent_key, privilidge:privilidge, key: req.body.key, 'type': req.body.type, admin_key: req.query.public_key, status: true }
      if (account) data = account;
      baseModel.add(req, res, usersPrivilidge, data, callback1, true);
    }
    else {
      callback(false);
    }
  }
  else {
    callback(false);
  }
}
  users.getUserData(req, res, userDataCallBack, true);
}

exports.updateUsersPrivilidge = function (req, res, callback) {
  var getPrivilidgeCallback = function (privilidge) {
    if (privilidge[0] != undefined) {
      var callback1 = function (obj, error) {
        if (obj.nModified) callback(true);
        else callback(false);

        //log.add(req, res,'updateUsersPrivilidge','allprivilidges',req.params.id,privilidge[0],data);

      }
      //change notification Based on  privilidge type
      if (req.body.type != privilidge[0].type) {
        var subscribecallback = function () { }
        //Subscription
        notification.subscribeAndUnscribeToTopicByRolesAndUserID(req, res, req.body.type, privilidge[0]['key'], subscribecallback)
        //UnSubscription
        notification.subscribeAndUnscribeToTopicByRolesAndUserID(req, res, privilidge[0].type, privilidge[0]['key'], subscribecallback, false)
      }
      if (req.body.type == '' || req.body.type == 'undefined' || req.body.type == null) req.body.type = '5c5ee0444e44ee1054e26a89';
      if(req.body.privilidge&&req.body.privilidge.length>0)
      {
         var privilidge = preparePermission(req.body.privilidge)
     
          if (typeof privilidge=='string'&&privilidge.length>0) {
            var data = { 'privilidge':privilidge, 'type': req.body.type };
            baseModel.update(req, res, usersPrivilidge, { _id: req.params.id }, data, callback1, false, true);
         }
         else {
           callback(false);
         }
       }
       else {
         callback(false);
       }
      
    }
  }
  baseModel.get(req, res, usersPrivilidge, { _id: req.params.id }, {}, getPrivilidgeCallback)
}

exports.deleteUsersPrivilidge = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  var getcallback = function (error, result) {
    //log.add(req, res,'deleteUsersPrivilidge','allprivilidges',req.params.id,result[0],'');
  }
  this.getUsersPrivilidge(req, res, { _id: req.params.id }, {}, getcallback);
  baseModel.delete(req, res, usersPrivilidge, { _id: req.params.id }, callback1, false, true);
}

exports.getAllUsersPrivilidges = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          delete obj[key].__v; delete obj[key].createdat;
          if (typeof obj[key].users[0] != 'undefined') {
            delete obj[key].users[0].username; delete obj[key].users[0].password;
            delete obj[key].users[0].email; delete obj[key].users[0].createdat;
            delete obj[key].users[0].pri_key; delete obj[key].users[0].__v;
          }
          if (typeof obj[key].privilidgetypes[0] != 'undefined') {
            delete obj[key].privilidgetypes[0].privilidge; delete obj[key].privilidgetypes[0].createdat;
            delete obj[key].privilidgetypes[0].pri_key; delete obj[key].privilidgetypes[0].__v;
            delete obj[key].privilidgetypes[0].key;
          }
        }
      }
      callback(obj, false);
    }
  }
  if (req.query.public_key == '082ff34a369c90ca') var where = { admin_key: '082ff34a369c90ca', key: { $nin: ['082ff34a369c90ca'] } };
  else var where = {
    $or: [
      { 'users.club_key': req.query.parent_key },
      { 'users.branch_key': req.query.parent_key },
      { key: { $nin: [req.query.parent_key, req.query.public_key] }, parent_key: req.query.parent_key }
    ]
  };
  baseModel.getJoin2(req, res, usersPrivilidge, 'users', 'key', 'pub_key', 'privilidgetypes', 'type', '_id', callback1, where, true);
}
//this function used when delete user from Club
exports.deleteUsersPrivilidgeByPubkey = function (req, res, where, callback) {
  console.log(where);
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  var getcallback = function (error, result) {
    //log.add(req, res,'deleteUsersPrivilidge','allprivilidges',req.params.id,result[0],'');
  }
  this.getUsersPrivilidge(req, res, { _id: req.params.id }, {}, getcallback);
  baseModel.delete(req, res, usersPrivilidge, where, callback1, false, true);
}

exports.addDefalutPrivilidge = function (req, res, parent_key, user_key, callback, units = false) {
  var getPrivilidgeTypeCallback = function (privilidge) {
    if (privilidge[0] != undefined) {
      var callback1 = function (obj, error) {
        if (error) callback(obj, error);
        else callback(obj, false);
      }
      var privilidge = preparePermission(privilidge[0]['privilidge'])

      if (units) parent_key = user_key;
      var data = { parent_key: parent_key, privilidge:privilidge, key: req.body.key, 'type':  privilidge[0]._id, admin_key: parent_key, status: true }
    
      baseModel.add(req, res, usersPrivilidge, data, callback1, true);
    }
  }
  var where = { key: parent_key, default: true }
  privilidgetypes.getPrivilidgeTypeByWhere(req, res, where, getPrivilidgeTypeCallback, true);
}


var  allPrivilidges = {
  "Users Mangement": {
    "Get All Users": "getallusers",
    "Invitation": "sendinvitations",
    "Delete user": "getallusersclub",
    "Update User": "updateuserdata",
    "Get User": "getuserdata",
    "Setting": "updatesettings"
  },
  "Privilidges": {
    "Add Privilidges": "addprivilidges",
    "Edit Privilidges": "editprivilidges",
    "Get Privilidges": "getprivilidges",
    "Delete Privilidges": "deleteprivilidges"
  },
  "Roles": {
    "Add Roles": "addprivilidgestype",
    "Edit Roles": "editprivilidgestype",
    "Get Roles": "getprivilidgestype",
    "Delete Roles": "deleteprivilidgestype"
  },
  "Membership": {
    "Add Membership": "addmembership",
    "Edit Membership": "editmembership",
    "Get Membership": "getmembership",
    "Delete Membership": "deletemembership"
  },
  "Activities": {
    "Add Activities": "addactivities",
    "Edit Activities": "editactivities",
    "Get Activities": "getactivities",
    "Delete Activities": "deleteactivities"
  },
  "Resoureces": {
    "Add Resoureces": "addunitresoureces",
    "Edit Resoureces": "editunitresoureces",
    "Get Resoureces": "getunitresoureces",
    "Delete Resoureces": "deleteunitresoureces"
  },
  "Shifts": {
    "Add Shifts": "addshifts",
    "Edit Shifts": "editshifts",
    "Get Shifts": "getshifts",
    "Delete Shifts": "deleteshifts"
  }
}

exports.getAllaccountsPrivilidges = function (req, res, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          delete obj[key].__v; delete obj[key].createdat;
          if (typeof obj[key].users[0] != 'undefined') {
            delete obj[key].users[0].username; delete obj[key].users[0].password;
            delete obj[key].users[0].email; delete obj[key].users[0].createdat;
            delete obj[key].users[0].pri_key; delete obj[key].users[0].__v;
          }
          if (typeof obj[key].adminprivilidgetypes[0] != 'undefined') {
            delete obj[key].adminprivilidgetypes[0].privilidge; delete obj[key].adminprivilidgetypes[0].createdat;
            delete obj[key].adminprivilidgetypes[0].pri_key; delete obj[key].adminprivilidgetypes[0].__v;
            delete obj[key].adminprivilidgetypes[0].key;
          }
        }
      }
      callback(obj, false);
    }
  }
  if (req.query.public_key == '082ff34a369c90ca') var where = { admin_key: '082ff34a369c90ca', key: { $nin: ['082ff34a369c90ca'] } };
  else var where = {
    $or: [
      { 'users.club_key': req.query.parent_key },
      { 'users.branch_key': req.query.parent_key },
      { key: { $nin: [req.query.parent_key, req.query.public_key] }, parent_key: req.query.parent_key }
    ]
  };
  where.key = req.params.pub_key
  baseModel.getJoin2(req, res, usersPrivilidge, 'users', 'key', 'pub_key', 'adminprivilidgetypes', 'type', '_id', callback1, where, true);
}



function preparePermission(stringPermission)
{
  
var  allPrivilidges = {
  "Users Mangement": {
    "Get All Users": "getallusers",
    "Invitation": "sendinvitations",
    "Delete user": "deleteuserdata",
    "Update User": "updateuserdata",
    "Create User":"createuser",
    "Get User": "getuserdata",
    "Setting": "updatesettings"
  },
  "Privilidges": {
    "Add Privilidges": "addprivilidges",
    "Edit Privilidges": "editprivilidges",
    "Get Privilidges": "getprivilidges",
    "Delete Privilidges": "deleteprivilidges"
  },
  "Roles": {
    "Add Roles": "addprivilidgestype",
    "Edit Roles": "editprivilidgestype",
    "Get Roles": "getprivilidgestype",
    "Delete Roles": "deleteprivilidgestype"
  },
  "Membership": {
    "Add Membership": "addmembership",
    "Edit Membership": "editmembership",
    "Get Membership": "getmembership",
    "Delete Membership": "deletemembership"
  },
  "Member Membership": {
    "Add Member Membership": "addmember_membership",
    "Edit Member Membership": "editmember_membership",
    "Get Member Membership": "getmember_membership",
    "Delete Member Membership": "deletemember_membership",
    "Upgrade Member Membership":"upgrademember_membership",
    "Downgrade Member Membership":"downgrademember_membership",
    "Renew Member Membership":"renewmember_membership",
    "payment  Member Membership":"paymentmember_membership"
  },
  "Activities": {
    "Add Activities": "addactivities",
    "Edit Activities": "editactivities",
    "Get Activities": "getactivities",
    "Delete Activities": "deleteactivities"
  },
  "Resoureces": {
    "Add Resoureces": "addunitresoureces",
    "Edit Resoureces": "editunitresoureces",
    "Get Resoureces": "getunitresoureces",
    "Delete Resoureces": "deleteunitresoureces"
  },
  "Shifts": {
    "Add Shifts": "addshifts",
    "Edit Shifts": "editshifts",
    "Get Shifts": "getshifts",
    "Delete Shifts": "deleteshifts"
  }
}
  var permission=stringPermission.split(',')
 var userPermission={}
 console.log('permission',allPrivilidges)

 Object.keys(allPrivilidges).forEach(permissions=>{
  var obj={}
   Object.keys(allPrivilidges[permissions]).forEach(elem=>{
    
    console.log(permission,allPrivilidges[permissions][elem])
    index=permission.indexOf(allPrivilidges[permissions][elem])
    if(!(index==-1))
    obj[elem]=allPrivilidges[permissions][elem]
    
   })
   userPermission[permissions]=obj

 })
console.log(userPermission)
return JSON.stringify(userPermission)
}