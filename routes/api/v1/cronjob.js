var express = require('express');
var router = express.Router();
var cron = require('node-cron');
var membership = require('../../../controller/membershipCrl');
var requ = {query:{},body:{}};
var resu = {};
membership.membershipWillExpire(requ,resu);
//send notification for membership expired
cron.schedule('00 10 * * *', () => {
  membership.membershipWillExpire(requ,resu);
}, {
  scheduled: true,
  timezone: "Africa/Cairo"
});
//send notification of membership Still havnt schedual yet
cron.schedule('00 11 * * *', () => {
  membership.membershipStillHaventpayment(requ,resu);
}, {
  scheduled: true,
  timezone: "Africa/Cairo"
});
//send notification of membership Still havnt Payment yet
cron.schedule('00 12 * * *', () => {
  membership.membershipStillHaventpayment(requ,resu);
}, {
  scheduled: true,
  timezone: "Africa/Cairo"
});



module.exports = router;
