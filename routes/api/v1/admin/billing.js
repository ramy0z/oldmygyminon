var express = require('express');
var router = express.Router();
var auth = require('../../../../models/auth/auth')
var log = require('../../../../controller/logCrl');

router.get('/getbill', function (req, res, next) {
  auth.Auth(req, res, function () {
    log.getMonthAllClubsBilling(req, res, function (result) {
      res.send(result);
    });
  }, 'userbase', true);
});

router.get('/getclubbill', function(req, res, next) {
  auth.Auth(req,res,function(){
      log.getMonthClubBilling(req, res ,function(result){
      res.send(result);
    });
  },'userbase',true);
});

////>>>>>>>>>>>>>>>>>>>>>>
router.get('/getbilldetails', function (req, res, next) {
  auth.Auth(req, res, function () {
    // if i want data from logs table use *reportClubTransations* 
        //>> data will be updates (online) any time you will get date  >> slower because large data
    // if i want data from monthtransaction table use *getClubTotalTrans*  
        //>>{depend on the history inserted in monthtransaction table from query of log} >> faster because small data

    //log.getClubTotalTrans(req, res ,function(result){
    log.reportClubTransations(req, res,true, function (result) {
      res.send(result);
    });
  }, 'userbase', true);
});

router.get('/getclubtransactiondetails', function (req, res, next) {
  auth.Auth(req, res, function () {
    log.getClubTransDetail(req, res, function (result) {
      res.send(result);
    });
  }, 'userbase', true);
});

router.get('/getmemberlogdetails', function (req, res, next) {
  auth.Auth(req, res, function () {
    log.getMemberTransations(req, res, function (result) {
      res.send(result);
    });
  }, 'userbase', true);
});
router.post('/payClubBill', function (req, res, next) {
  auth.Auth(req, res, function () {
    log.payBill(req, res, function (result) {
      res.send(result);
    });
  }, 'userbase', true);
});
  module.exports = router;
