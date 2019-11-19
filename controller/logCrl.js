var baseModel = require('../models/baseModel');
var userModel = require('../models/users/user');
var log = require('../models/transaction/log');
var monthtransModel = require('../models/transaction/monthtransaction');
var billingModel = require('../models/transaction/billing');
var adminmembershipsModel = require('../adminModels/membership');
var user = require('../controller/userCrl');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.add = function (req, res, action, table, log_key_state, ref_id, pref_id, trans_num = 1,
  ref_scadual_arr = [], pref_scadual_arr = [], parent_key = null, public_key = null) {
  var usercallback = function (user) {
    /* save action tress */
    var club = ''; var branch = ''; var units = '';
    if (user[0] != undefined && user[0].branch_key != undefined) {
      club = user[0].club_key;
      branch = user[0].branch_key;
      units = req.query.parent_key;
    }
    else if (user[0] != undefined && user[0].club_key != undefined) {
      club = user[0].club_key;
      branch = req.query.parent_key;
      units = req.query.parent_key;
    } else {
      club = req.query.parent_key;
      branch = req.query.parent_key;
      units = req.query.parent_key;
    }
    ref_id = ObjectId(ref_id);

    var addcallback = function () { }
    var data = {
      author: req.query.public_key,
      club,
      branch,
      units,
      log_key_state,
      action,
      table,
      ref_id,
      // pref_id,
      trans_num
      // ref_scadual_arr,
      // pref_scadual_arr
    }
    //console.log(data)
    if (pref_id != '') data.pref_id = ObjectId(pref_id);
    if (ref_scadual_arr.length > 0) data.ref_scadual_arr = ref_scadual_arr;
    if (pref_scadual_arr.length > 0) data.pref_scadual_arr = pref_scadual_arr;
    //console.log(data);
    baseModel.add(req, res, log, data, addcallback, true);
  }
  user.getUserByPublickeys(req, res, { pub_key: req.query.public_key }, usercallback);
}

// query to get *Club* OR *ALL Clubs* Transaction Total
//OUT PUT:[{"month": "2019-10-1","club": "01a3a4e66c98b32e","branch": "01a3a4e66c98b32e",
//"transaction": "ReNew Membership sold","calc": 1,"tTrans": 1,"tRevneu": 220 }]
exports.reportClubTransations = function (req, res, isAdmin, callback) {
  resultObj={};
  var club_key = (!isAdmin)?req.query.club_key :"";
  var start_date = req.query.start_date;
  var end_date = req.query.end_date ;
  var startDt = new Date(start_date);
  var endDt= new Date(end_date);
  startDt.setHours(00);startDt.setMinutes(00);startDt.setMilliseconds(00);
  endDt.setHours(23);startDt.setMinutes(59);startDt.setMilliseconds(100);
  if (club_key == undefined || start_date == undefined || end_date == undefined  || startDt =="Invalid Date" ||endDt=="Invalid Date"  ){
    var message = "Invalid : ";
        message += (club_key == undefined )?" Club Key":"";
        message += (start_date == undefined || startDt =="Invalid Date")?" Start Date":"";
        message += (end_date == undefined || endDt =="Invalid Date")?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    
    group = {
      _id: {club: "$club",branch: "$branch", name : "$weights.name",weight:"$weights.weight" , calc:"$weights.calc"},
      "trans": { $sum: "$trans_num" },tRevneu: { $sum: { $convert: { input: "$mPayment.fees", to: "double" } } }
    }
    //club: "$_id.club",branch: "$_id.branch" ,weight:"$_id.weight",trans_num: "$trans" , 
    project={_id : 0 , club: "$_id.club",branch: "$_id.branch",transaction: "$_id.name" ,weight:"$_id.weight",calc:"$_id.calc", tTrans:{$multiply: [ "$_id.weight", "$trans" ]} ,tRevneu:"$tRevneu"  };

    where= (!isAdmin)?{ "club" : club_key , "createdat": { "$gte": startDt, "$lte": endDt }} : 
                  { "createdat": { "$gte": startDt, "$lte": endDt }};
    baseModel.logAllClubtransaction(req, res,log ,group ,project,where ,function (resultLog) {
      callback(resultLog);
    }, true);
  }
 }

//1- ADD ALL CLUB Total Transactions Every Month In Table MonthTransaction 
addMonthClubsTransations = function (req, res, callback) {
  resultObj={};
  // get 10/2019
  var month = req.query.month;
  // var end_date = req.query.end_date ; || end_date == undefined
  if (month == undefined){
    var message = "Invalid : ";
        message += (month == undefined)?" Month":"";
        // message += (end_date == undefined)?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    var d=new Date (month);
    var monthDt=(d.getMonth() + 1) ; var year= d.getFullYear() ;
    var first_date= year+"-"+ monthDt +"-"+"01";
    var last_date = year+"-"+ monthDt +"-"  +new Date( year , monthDt , 0 ).getDate();

    startDt =new Date(first_date) ;//
    endDt= new Date(last_date);//
    startDt.setHours(00);startDt.setMinutes(00);startDt.setMilliseconds(00);
    endDt.setHours(23);startDt.setMinutes(59);startDt.setMilliseconds(100);
  
    group = {
      _id: { club: "$club", branch: "$branch", name: "$weights.name", weight: "$weights.weight", calc: "$weights.calc" },
      "trans": { $sum: "$trans_num" }, tRevneu: { $sum: { $convert: { input: "$mPayment.fees", to: "double" } } }
    }
    //club: "$_id.club",branch: "$_id.branch" ,weight:"$_id.weight",trans_num: "$trans" , 
    project={_id : 0  ,club: "$_id.club",branch: "$_id.branch",transaction: "$_id.name" ,weight:"$_id.weight",calc:"$_id.calc", tTrans:{$multiply: [ "$_id.weight", "$trans" ]} ,tRevneu:"$tRevneu"  };
    // where= {club :club_key , "createdat": { "$gte": startDt, "$lte": endDt }};
    where = { "createdat": { "$gte": startDt, "$lte": endDt } };
    baseModel.logAllClubtransaction(req, res, log, group, project, where, function (resultLog) {
      //console.log(resultLog);
      transDetails = { transDetails: resultLog };
      // insert details sum of  transactions of all clubs 
      baseModel.updateoradd(req, res, monthtransModel, { "month" : first_date }, transDetails, function(InsertResult , error){
        if (error) callback({result :false, error});
        else callback({result : true, data:InsertResult});
      },true);
      //  baseModel.addmany(req, res, monthtransModel, resultLog, function(res){
      //       callback(res);
      //  },true);
    }, true);
  }
}
exports.addMonthClubsTransations = addMonthClubsTransations;

function FormDatabillingClub(adminmembershipRes, start_date, end_date, club_key, totalTransactionNumber, clubRevenus) {
  // totalTransactionNumber=2000;
  var package_title, trans_max_num, fees_percent, description, discount;
  //  the pakage found in the frist package and give the clube the frist one
  if (totalTransactionNumber <= adminmembershipRes[0]['trans_max_num']) {
    package_title = adminmembershipRes[0]['title'];
    trans_max_num = adminmembershipRes[0]['trans_max_num'];
    fees_percent = adminmembershipRes[0]['fees_percent'];
    description = adminmembershipRes[0]['description'];
    discount = adminmembershipRes[0]['discount'];
  }
  //  the package not found and give the clube the last pakage
  else if (totalTransactionNumber >= adminmembershipRes[adminmembershipRes.length - 1]['trans_max_num']) {
    var index = adminmembershipRes.length - 1;
    package_title = adminmembershipRes[index]['title'];
    trans_max_num = adminmembershipRes[index]['trans_max_num'];
    fees_percent = adminmembershipRes[index]['fees_percent'];
    description = adminmembershipRes[index]['description'];
    discount = adminmembershipRes[index]['discount'];
  }
  else {
    for (var i = 0; i < adminmembershipRes.length; i++) {
      //{ title: '250 Current User', trans_max_num: 250, fees_percent: 6 }
      var MaxTransNum = parseFloat(adminmembershipRes[i]["trans_max_num"]);
      if (totalTransactionNumber <= MaxTransNum) {
        package_title = adminmembershipRes[i]['title'];
        trans_max_num = adminmembershipRes[i]['trans_max_num'];
        fees_percent = adminmembershipRes[i]['fees_percent'];
        description = adminmembershipRes[i]['description'];
        discount = adminmembershipRes[i]['discount'];
        break;
      }
    }
  }
  //console.log(clubRevenus , (parseFloat(fees_percent)/100))
  fees = parseFloat(clubRevenus) * (parseFloat(fees_percent) / 100); // amount to pay from club
  // check if no data in admin membershipsetting >>> 
  //set the last row setting ex.trans_max_num=1000 >> fees_percent=3%

  //"Date , Description , Amount , Actions (Download invoice and Export Excel) - Header
  //- Summary * Description + ""Amount"" , sub total , discount , pay percentage, total 
  // Table to show 
  // Transaction Name , Number of this transaction , weight (+1,-1 , 0 and etc ).

  return finalResaltData = {
    "club":club_key,
      "start_date": start_date, "end_date" : end_date,  "sub_total": fees, "discount": discount, "pay_percentage": fees_percent,
      "package_title": package_title, "package_description": description, "trans_max_num": trans_max_num, "weight":weight ,  "trans_amount": totalTransactionNumber,
      "club_revenus": clubRevenus 
      //,"billing_method": "" ,payment_status :  "" 
    };
}
//2-
exports.addMonthClubsBilling = function (req, res, callback) {
  // check for Start And End Billing Period
  var month = req.query.month;
  if (month == undefined  ){//|| end_date == undefined
    var message = "Invalid : ";
        message += (month == undefined)?" Month ":"";
        // message += (end_date == undefined)?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    var d=new Date (month);
    var monthDt=(d.getMonth() + 1) ; var year= d.getFullYear() ;
    var first_date= year+"-"+ monthDt +"-"+"01";
    var last_date = year+"-"+ monthDt +"-"  +new Date( year , monthDt , 0 ).getDate();

    startDt =new Date(first_date) ;//
    endDt= new Date(last_date);//
    startDt.setHours(00);startDt.setMinutes(00);startDt.setMilliseconds(00);
    endDt.setHours(23);startDt.setMinutes(59);startDt.setMilliseconds(100);
  
    // add to monthtransaction table total transaction data of all clubs
    addMonthClubsTransations(req, res, function(totTransRes){
      //console.log(totTransRes["data"]);
      //totTransRes["data"]["nModified"]==1 >>> modified
      //typeof(totTransRes["data"]["upserted"])!== undefined >> inserted
      if(totTransRes["result"]==true && typeof(totTransRes["data"]["upserted"]) != "undefined"){
        // get data from monthtransaction Table Then Loop In Result to Get Total Trans And Total Club Revneus 
        //{$and:[{startDate:{$gte:startDt}},{endDate:{$lte:endDt}}] }
        baseModel.get(req, res, monthtransModel,  { "month": first_date} ,{_id:0 , month:1,transDetails:1}, function(monthTransResult) {
          //console.log(monthTransResult);
          if (monthTransResult.length<=0) callback({result: false, data: "NO Data Inserted month transaction is Empty !"}) 
          var monthTransResultObj=monthTransResult[0]["transDetails"];
          //console.log("monthTransResultObj",monthTransResultObj);
          var totalTransRvenusClubObj = {}; // will form to be => { {club_key : [ totalTransactionNumber, clubRevenus ] } ,}
          // var totalTransactionNumber, clubRevenus=0; 
          if (monthTransResultObj.length <= 0) {
            // no transaction done in this club
            callback({result: false, data: "NO Data Inserted month transaction is Empty !"}) 
          }
          else {
            // get the setting of max transaction and its fees
            baseModel.get(req, res, adminmembershipsModel, {}, {_id:0 , title :1  ,description:1 ,trans_max_num:1 , fees_percent:1, discount:1} , function(adminmembershipRes){
               // loop to calculate fees of transactions
               monthTransResultObj.forEach(function(transElement) {
                //monthTransResultObj OUTPUT: {"club": "01a3a4e66c98b32e","branch": "01a3a4e66c98b32e","transaction": "PT Attendance Schedule",
                //   "weight": 1000,"calc": 0,"trans_num": 479,"tTrans": 479000,"tRevneu": 2340
                // }
                // i want to form totalTransRvenusClubObj={club_key : [ totalTransactionNumber, clubRevenus ] }
                //console.log(transElement);
                club_key = transElement["club"];
                if (typeof (totalTransRvenusClubObj[club_key]) === "undefined") { totalTransRvenusClubObj[club_key] = [0, 0]; }
                totalTransRvenusClubObj[club_key][0] += ((transElement.calc == 1) ? transElement.tTrans : 0);
                totalTransRvenusClubObj[club_key][1] += ((transElement.calc == 1) ? transElement.tRevneu : 0);
                // totalTransactionNumber+=(transElement.calc==1)?transElement.tTrans : 0;
                // clubRevenus+=(transElement.calc==1)?transElement.tRevneu : 0
              });
              //foreach membership package to get the max transaction and its fees precentage 
              if (adminmembershipRes.length <= 0) {
                callback({ "result": false, "data": "Invalid Setting for admin memberShip Package !" });
              }
              else {
                //console.log("totalTransRvenusClubObj " , totalTransRvenusClubObj);
                //FormDatabillingClub(adminmembershipRes, totalTransactionNumber , clubRevenus )
                finalArrToInsert = [];
                Object.keys(totalTransRvenusClubObj).forEach(item => {
                  club_key_value =item ;
                  totalTransactionNumber =totalTransRvenusClubObj[item][0];
                  clubRevenus =totalTransRvenusClubObj[item][1];
                  finalArrToInsert.push(FormDatabillingClub(adminmembershipRes,startDt , endDt , club_key_value  ,totalTransactionNumber , clubRevenus ) );
                });
                // add data to billing Table club start_daten end_date
                //billingObject={ month : start_date , data :finalArrToInsert } 
                // baseModel.updateoradd(req, res, billingModel, { "month" : start_date }, billingObject, function(InsertResult , error){
                //   if (error) callback({result :false, error});
                //   else callback({result : true, data:" "});
                // },true);
                baseModel.addmany(req, res, billingModel, finalArrToInsert, function (res) {
                  callback(res);
                }, true);
                //console.log(finalArrToInsert);
              }

            }, true, sort = { trans_max_num: 1 });
          }

        }, true);
      }
      else{
        callback({result:false , data: "Error While Add Total Transaction Data!, there are billing already in this month"})
      }
    });
  }
}



// get  information about billing of all clubs by start and end date
exports.getMonthAllClubsBilling = function (req, res, callback) {
  var start_date = req.query.start_date;
  var end_date = req.query.end_date ;
  var startDt = convToShortDt(start_date);
  var endDt= convToShortDt(end_date);
  if (start_date == undefined || end_date == undefined  || startDt =="Invalid Date" ||endDt=="Invalid Date"  ){
    var message = "Invalid : ";
        message += (start_date == undefined || startDt =="Invalid Date")?" Start Date":"";
        message += (end_date == undefined || endDt =="Invalid Date")?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
 
    baseModel.get(req, res, billingModel, {"start_date" : { "$gte": startDt ,"$lte": endDt} }, { } , function(billingRes){
      callback({result: true , data : billingRes});
    });
  }
}

// get  information about billing of one club by start and end date and club_key
exports.getMonthClubBilling = function (req, res, callback) {
  var club_key = req.query.club_key;
  var start_date = req.query.start_date;
  var end_date = req.query.end_date ;
  var startDt = convToShortDt(start_date);
  var endDt= convToShortDt(end_date);
  if (club_key == undefined ||start_date == undefined || end_date == undefined  || startDt =="Invalid Date" ||endDt=="Invalid Date"  ){
    var message = "Invalid : ";
        message += (club_key == undefined)?" Club Key":"";
        message += (start_date == undefined || startDt =="Invalid Date")?" Start Date":"";
        message += (end_date == undefined || endDt =="Invalid Date")?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    
    baseModel.get(req, res, billingModel, { club :club_key , "start_date" : { "$gte": startDt ,"$lte": endDt} }, { } , function(billingRes){
      callback({result: true , data : billingRes});                                                             //_id:0
    });
  }
}

// Get TOTAL Transaction from Trable MonthTransaction for club
exports.getClubTotalTrans = function (req, res, callback) {
  var club_key = req.query.club_key;
  var start_date = req.query.start_date;
  var end_date = req.query.end_date;
  
  // conver any date come from user to short date 
  var startDt = convToShortDt(start_date);
  var endDt= convToShortDt(end_date);
  if (club_key == undefined || start_date == undefined || end_date == undefined  || startDt =="Invalid Date" ||endDt=="Invalid Date"  ){
    var message = "Invalid : ";
        message += (club_key == undefined) ? " Club Key" : "";
        message += (start_date == undefined || startDt =="Invalid Date")?" Start Date":"";
        message += (end_date == undefined || endDt =="Invalid Date")?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else {
    //$and:[{startDate:{$gte:startDt}},{endDate:{$lte:endDt}}]
    //{ $gte: req.query.startDay,$lte: req.query.endDay}
    match = { "transDetails.club": club_key ,"month":{"$gte":start_date , "$lte":end_date } };
      baseModel.logClubTransaction(monthtransModel, match, function (result) {
        callback(result);
      });
  }
}


/// get details of transaction from log table 
exports.getClubTransDetail = function (req, res, callback) {
  // OUTPUT  {"ref_scadual_arr": [], "pref_scadual_arr": [],
  //     "_id": "5db010a2c7528b1dac45cf3c", "author": "01a3a4e66c98b32e","branch": "01a3a4e66c98b32e",
  //"units": "01a3a4e66c98b32e","log_key_state": "new_membership_sold","ref_id": "5db00e581a1e1323f08c0d7c",
  //     "createdat": "2019-10-23T08:34:42.725Z"
  // }
  resultObj = {};
  var club_key = req.query.club_key
  var start_date = req.query.start_date;
  var end_date = req.query.end_date ;
  var startDt =new Date(start_date) ;//
  var endDt= new Date(end_date);//
  startDt.setHours(00);startDt.setMinutes(00);startDt.setMilliseconds(00);
  endDt.setHours(23);startDt.setMinutes(59);startDt.setMilliseconds(100);

  if (club_key == undefined ||start_date == undefined || end_date == undefined  || startDt =="Invalid Date" ||endDt=="Invalid Date"  ){
    var message = "Invalid : ";
        message += (club_key == undefined)?" Club Key":"";
        message += (start_date == undefined || startDt =="Invalid Date")?" Start Date":"";
        message += (end_date == undefined || endDt =="Invalid Date")?" End Date":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    select={'author':1,'club':1,'branch':1,'units':1,trans_name:'$transaction_weights.name',
            'ref_id':1,'pref_id':1 ,"ref_scadual_arr" :1,"pref_scadual_arr":1,'createdat':1
          };
    where= { 'club':club_key , "createdat": { "$gte": startDt, "$lte": endDt }};
    // baseModel.get(req, res,log ,where ,select  ,function (resultLog) {
    //   //console.log(resultLog)
    //   resultObj = {result:true , data : resultLog};
    //   callback(resultObj);
    // }, true);

    baseModel.getJoinWithSelect(req, res, log, "transaction_weights", "log_key_state","trans_key_state", select ,  where , function (resultLog){
      resultObj = {result:true , data : resultLog};
            callback(resultObj);
    },true);

  }


}

exports.getMemberTransations = function (req, res, callback) {
  var member_key = req.query.member_key 
  if (member_key == undefined ){
    var message = "Invalid : ";
        message += (member_key == undefined)?" member Key":"";
    resultObj = {result:false , data : message};
    callback(resultObj);
  }
  else{
    resultObj={};
    select = {_id: 1,trans_num: 1,ref_scadual_arr: 1,pref_scadual_arr: 1,
      author: 1,club: 1,branch: 1,trans_name: { $arrayElemAt: ["$transaction_weights.name", 0] },
      ref_id: 1,pref_id: 1,createdat: 1,type: "$membershipRef.type",
      auter_name: "$users.name",user_key: "$membershipRef.pub_key",
      mship_ref_start_end: ["$membershipRef.start_date", "$membershipRef.end_date"],
      mship_parent_start_end: [{ $arrayElemAt: ["$membershipParent.start_date", 0] }, { $arrayElemAt: ["$membershipParent.end_date", 0] }],
    };
    where= { "pub_key" : member_key};
    baseModel.memberTransgetJoin4(req, res ,log ,select , where,function (resultLog) {
      resultObj = {result:true , data : resultLog};
      callback(resultObj);
    }, true);
  }
}

//pay bill from admin socyle
exports.payBill = function (req, res, callback) {
  var id = req.body.bill_Key;
  var billing_method = req.body.method;
  var payment_date = req.body.date;
  var paymrntDT=new Date(payment_date.toString());
  var payment_status = "Paid";
  var payment_author = req.query.public_key;
  if (id==undefined || billing_method == undefined||payment_date == undefined||payment_author == undefined ||paymrntDT =="Invalid Date") {
    var message = "Invalid : ";
    message += (id == undefined) ? " Bill Key" : "";
    message += (billing_method == undefined) ? " Billing Method" : "";
    message += (payment_date == undefined || paymrntDT =="Invalid Date")?"  Payment Date":"";
    message += (payment_author == undefined)?"  Author":"";
    resultObj = { result: false, data: message };
    callback(resultObj);
  }
  else {
    var transDetails={ "billing_method": billing_method,"payment_status": payment_status,
     "payment_date" : paymrntDT,"payment_author" : payment_author
    }
    baseModel.updateoradd(req, res, billingModel, { "_id": ObjectId(id) }, transDetails, function (InsertResult, error) {
      if (error) callback({ result: false, data: error });
      else callback({ result: true, data: InsertResult });
    }, true);
  }
}
function convToShortDt(start_date){
    // conver any date come from user to short date 
    var d=new Date (start_date);
    if(d !="Invalid Date"){
      var year= d.getFullYear() ;var monthDt=(d.getMonth() + 1) ; var day=d.getDate();
      return  year+"-"+ monthDt +"-"+day;
    }
    else{ return"Invalid Date";}

  
}
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  } return true;
}
//check if string is valid json
function isJson(str) {
  try { JSON.parse(str); }
  catch (e) { return false; }
  return true;
}
