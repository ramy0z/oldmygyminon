var emails = require('../models/emails/emails');
var confirmMails = require('../models/confirmMail');
var userCrl = require('./userCrl');
var usermodel = require('../models/users/user');
var baseModel = require('../models/baseModel');
var nodemailer = require('nodemailer');
var optionsCrl = require('./optionsCrl');
var mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
//send emails
exports.sendemail = function (req, res, to, subject, body, user = '', callback1) {
  var callback = function (obj) {
    if (typeof obj[0] != 'undefined') to = obj[0].email;
    sendemailbase(to, subject, body, callback1);
  }
  if (user != '') {
    userCrl.getUserByPublickeys(req, res, { 'pub_key': user }, callback);
  } else callback({});

}

exports.sendemailWithOptionCheck = function (req, res, callback1, to, subject, body, user = '', key) {
  var getOptionCallback = function (options) {
    if (options[0] != undefined && options[0][key]) {
      var callback = function (obj) {
        if (typeof obj[0] != 'undefined') to = obj[0].email;
        sendemailbase(to, subject, body, callback1);
      }
      if (user != '') {
        userCrl.getUserByPublickeys(req, res, { 'pub_key': user }, callback);
      } else callback({});
    }
  }
  var where = { pub_key: req.query.parent_key, key: key }
  optionsCrl.getOption(req, res, where, { key: 1, value: 1, _id: 0 }, getOptionCallback)
}

exports.getEmail = function (req, res, callback) {
  var callback2 = function (users) {
    var callback1 = async function (obj, error) {
      if (error || obj.length == 0) callback(obj, error);
      else {
        var i = 1; var result = [];
        Object.keys(obj).forEach(async function (key) {
          var from_name = ''; var author_name = '';
          if (obj[key].author_key == undefined) var author_key = 0; else var author_key = obj[key].author_key;
          await userCrl.asyncget(req, res, { pub_key: { $in: [obj[key].from, author_key] } }, ['name', 'pub_key']).then(users => {
            Object.values(users).forEach(async function (user) {
              if (obj[key].from == user.pub_key) from_name = user.name;
              if (author_key == user.pub_key) author_name = user.name;
            });
            result[key] = {
              increment: (parseInt(key) + 1), _id: obj[key]._id, to: obj[key].to, status: obj[key].status, createdat: obj[key].createdat,
              from: { name: from_name, id: obj[key].from }, author: { name: author_name, id: author_key }
            };
          })
          if (obj.length == i) callback(result, false);
          i++;
        });
      }
    }
    var allkeys = new Array();
    Object.keys(users).forEach(function (key) { allkeys.push(users[key].pub_key) });
    if (req.body.email) var where = { reason: 'invitation', from: { $in: allkeys }, to: req.body.email, $and: [{}] }
    else var where = { from: { $in: allkeys }, reason: 'invitation', $and: [{}] };
    if (req.query.search) {
      var search = req.query.search.toString();
      where['$and'].push({
        $or: [
          { 'status': { '$regex': search } },
          { 'to': { '$regex': search } }
        ]
      });
    }
    //filter by status
    if (req.query.status) {
      var status = req.query.status.toString();
      where['$and'].push({ status: status });
    }
    //filter by status
    if (req.query.author_key) {
      var author_key = req.query.author_key.toString();
      where['$and'].push({ author_key: author_key });
    }
    //filter by privilidge
    if (req.query.orderby && req.query.order) {
      if (req.query.orderby == 'id') var sort = { _id: parseInt(req.query.order) }
      else if (req.query.orderby == 'status') var sort = { status: parseInt(req.query.order) }
      else if (req.query.orderby == 'email') var sort = { to: parseInt(req.query.order) }
      else var sort = { createdat: -1 };
    }

    baseModel.get(req, res, emails, where, {}, callback1, true, sort);
  }
  var where = {
    $or: [
      { branch_key: req.query.parent_key },
      { club_key: req.query.parent_key },
      { pub_key: req.query.parent_key },
    ]
  }
  userCrl.getUserByPublickeys(req, res, where, callback2);
}

exports.getEmailById = function (req, res, id, callback) {

  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }
  var data = { _id: id };
  baseModel.get(req, res, emails, data, {}, callback1, true);

}

exports.addEmail = function (req, res, sender, to, reason, all = '', user_type, callback) {
  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }
  var data = { from: sender, to: to, reason: reason, user_type: user_type, author_key: req.query.public_key, status: 'pending', all: all }
  baseModel.add(req, res, emails, data, callback1, true);
}

exports.getEmailByWhere = function (req, res, where, callback) {

  var callback1 = function (obj, error) {
    if (error) callback(obj, error);
    else callback(obj, false);
  }
  baseModel.get(req, res, emails, where, {}, callback1, true);
}

exports.updateEmail = function (req, res, where, data, callback) {
  var callback1 = function (obj, error) {
    if (obj.nModified) callback(true);
    else callback(false);
  }
  baseModel.update(req, res, emails, where, data, callback1, false, true);
}

exports.deleteEmail = function (req, res, data, callback) {
  var callback1 = function (obj, error) {
    if (!obj.n) callback(false);
    else callback(true);
  }
  baseModel.delete(req, res, emails, data, callback1, false, true);
}

exports.getUsresWhichSendEmails = function (req, res, callback) {
  var callback2 = function (users) {
    var allkeys = new Array();
    Object.keys(users).forEach(function (key) {
      allkeys.push({ pub_key: users[key].pub_key, name: users[key].name });
    });
    callback(allkeys);
  }
  var where = {
    $or: [
      { branch_key: req.query.parent_key },
      { club_key: req.query.parent_key },
      { pub_key: req.query.parent_key },
    ]
  }
  userCrl.getUserByPublickeys(req, res, where, callback2);
}

var sendemailbase = function (to, subject, body, callback1) {
  var transporter = nodemailer.createTransport({
    host: "https://mygymin.herokuapp.com/",
    service: 'gmail',
    auth: {
      user: 'admonsocyle2019@gmail.com',
      pass: 'SOCYLEgymin123!@#'
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  var mailOptions = {
    from: 'Gymin App <admonsocyle2019@gmail.com>',
    to: to,
    subject: subject,
    html: body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return callback1(false);
    } else return callback1(true);
  });
}




exports.confrmmailcode = function (req, res, data, callback) {
  var callback1 = function (obj, error) {
    if (obj._id) {
      callback(true)
    }
  }
  baseModel.add(req, res, confirmMails, data, callback1);
}


exports.checkConfirmMailcode = function (req, res, callback) {

  var callback1 = function (obj, error) {
    if (obj.length > 0) {
      let min = Math.ceil((Math.abs(new Date() - obj[0].createdat)) / 60000)
      
      if (min <= parseInt(obj[0].submission)) {
        if (obj[0].confirmcode == req.query.id) {
          req.params.pub_key = req.query.pub_key
          req.body.status = 'active'
          baseModel.update(req,res,usermodel,{pub_key:req.query.pub_key},{status:true},(res)=>{
             callback({ result: true, data: 'confirmed' })
             baseModel.delete(req, res, confirmMails, { _id: ObjectId(obj[0]._id) }, (call) => {

            })
          })
        }
        else callback({ result: false, data: 'invalid confirm code' })
      }
      else callback({ result: false, data: 'expired confirm code' })

    }
    else callback({ 'result': false, 'data': 'invalid user' })
    
  }
  baseModel.get(req, res, confirmMails, { pub_key: req.query.pub_key, confirmcode: req.query.id }, {}, callback1);
}



exports.resendconfrmmailcode = function (req, res, callback) {
  var rand = CreateRand()
  var callback1 = (obj, error)=> {
    if (obj.nModified) {
      userCrl.userbyPub_key(req, res, (result) => {
        var mailcallback = function (result) {

          if (result) callback({ result: true, data: 'Confirm code sended' })
          else callback({ 'result': false, 'data': 'Sorry,May be error ocurred .try again' })
        }
        //body of mail confirmation 
      
        let link = "http://" + req.get('host') + "/api/member/v1/auth/verify?id=" + rand + "&pub_key=" + result[0].pub_key;
        var body = "<h1>Thank you to join GYMIN family</h1> <br/> Confirm code :" + rand + " <br>You can also  confirm from this link :" + link + " </h1>"

        this.sendemail(req, res, result[0].email, 'confirm', body, '', mailcallback)
      })
    }
    else callback({ 'result': false, 'data': 'Sorry,May be error ocurred .try again' })

  }
  baseModel.update(req, res, confirmMails, { pub_key: req.query.pub_key }, { confirmcode: rand,createdat:Date.now()}, callback1);
}
function CreateRand() {
  let x = Math.floor((Math.random() * 100))
  x = x.toString()
  while (x.length != 4) {
    x = x + Math.floor((Math.random() * 100))
  }
  return x
}

