var baseModel = require('../models/baseModel');
var membershipandpayments = require('../models/membership/membershipandpayment')
var monthtransModel = require('../models/transaction/monthtransaction');
var usermetas = require('../models/users/userMeta')
var users = require('../models/users/user')
var activity = require('../models/activities/activities')
var attendance = require('../models/attendance/attendance')
var attendanceCrl = require('../controller/attendanceCrl')
var log = require('../controller/logCrl')
var user = require('../controller/userCrl')
var async = require('async');
//var auth = require('../../../models/auth/auth');

//
function reportsSolidMembership(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //
    //defaultTime
    filterTime(where, req)

    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'membershipsolid': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'membershipsolid': 0 })
    }

    baseModel.databaseSumOperations(req, res, membershipandpayments, 'fees', resultCallBack, where)
}


function reportsDiscount(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'discount': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'discount': 0 })
    }

    baseModel.databaseMulOperation(req, res, membershipandpayments, 'original_fees', 'discount', resultCallBack, where, 'createdat')
}

function reportsNoMembership(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'Nomembership': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'Nomembership': 0 })
    }

    baseModel.databaseCountOperation(req, res, membershipandpayments, resultCallBack, where)
}

function reportsCanceledMembership(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'cancelMembership': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'cancelMembership': 0 })

    }

    where.status = 'cancel'
    baseModel.databaseCountOperation(req, res, membershipandpayments, resultCallBack, where, 'createdat')
}
function reportsRevenus(req, res, callback, condition) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ], 'status': 'active'
    }

    if (condition) {
        where.status = condition.status
    }

    console.log(where, condition)
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        if (result.length == 1 && !req.query.filtertime)
            callback({ 'Revenus': result[0].total })
        else if (result.length > 1 || req.query.filtertime)
            callback({ 'result': result })
        else callback({ 'Revenus': 0 })

    }

    baseModel.databaseSumOperations(req, res, membershipandpayments, 'fees', resultCallBack, where, 'createdat')
}

function reportsSubscribedMembers(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'subscribedMembers': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'subscribedMembers': 0 })

    }
    where.value = "member"
    where.key = "user_type"
    baseModel.databaseCountOperation(req, res, users, resultCallBack, where, 'createdat')
}

function reportsStaff(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime

    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'staff': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'staff': 0 })

    }
    where.value = "staff"
    where.key = "user_type"
    baseModel.databaseCountOperation(req, res, users, resultCallBack, where, 'createdat')
}


function reportsUsers(req, res, callback, where) {
    console.log(where)
    var resultCallBack = function (result) {
        if (result.length == 1)
            callback({ 'users': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'users': 0 })
    }
    baseModel.databaseCountOperation(req, res, users, resultCallBack, {}, 'createdat')
}


function reportsActivity(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {
        console.log(result)
        if (result.length == 1)
            callback({ 'Activity': result[0].total })
        else if (result.length > 1)
            callback(result)
        else callback({ 'Activity': 0 })

    }

    baseModel.databaseCountOperation(req, res, activity, resultCallBack, where, 'createdat')
}


function reportsAttendance(req, res, callback) {
    req.query.perpage = 10000000
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //defaultTime
    filterTime(where, req)
    var resultCallBack = function (result) {

        //dimesional array for(day of week,hour of attendance)
        var attendance = new Array(7)
        for (i = 0; i < 7; i++) {
            attendance[i] = new Array(24)
            for (let index = 0; index < 24; index++) {
                attendance[i][index] = 0;

            }
        }
        //loop to each attendance and group it by hours and day of week
        if (res.length > 0)
            result.forEach(element => {
                let dayOfWeek;
                if (element.day)
                    //calcualte num of day 
                    dayOfWeek = new Date(element.day).getDay();
                //calvulate range of hours
                if (element.from && element.to) {
                    //cacualte index end of attendance in array
                    let end = parseInt((element.to).split(":")[0])
                    if (end == '0') end = 23
                    else end = end - 1
                    //cacualte index start of attendance in array
                    let start = parseInt((element.from).split(":")[0])
                    start = start - 1;
                    //calcuste user in each hour 
                    while (end > start) {
                        console.log(start)
                        if (typeof attendance[dayOfWeek][start] == 'undefined') attendance[dayOfWeek][start] = 0
                        attendance[dayOfWeek][start] = ((attendance[dayOfWeek][start]) + 1);
                        start++
                    }

                }
            });
        callback(attendance)

    }

    attendanceCrl.getattendance(req, res, where, resultCallBack)
}

//Refund 
function refundReports(req, res, callback) {

    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    filterTime(where, req)
    var refundcallback = function (result) {
        callback(result)
    }

    baseModel.databaseSumOperations(req, res, membershipandpayments, 'payment_refund', refundcallback, where, 'createdat')
}
function getrenew(req, res, callback) {
    var renewcallback = function (result) {
        if (result.Revenus)
            callback({ 'renew': result.Revenus })
        else callback({ 'renew': 0 })
    }
    reportsRevenus(req, res, renewcallback, { 'status': 'renew' })

}

function getupgrade(req, res, callback) {
    var renewcallback = function (result) {
        if (result.Revenus)
            callback({ 'upgrade': result.Revenus })
        else callback({ 'upgrade': 0 })
    }
    reportsRevenus(req, res, renewcallback, { 'status': 'upgrade' })

}

function getprofitShare(req, res, callback) {
    async.parallel([function frist() {
        reportsRevenus(req, res, callback),

            getrenew(req, res, callback),
            getupgrade(req, res, callback)

    }]
        , function (err, result) {

            if (err) throw (err)
            callback(result)

        })
}



function totalReports(req, res, callback) {
    async.parallel([function frist() {
        reportsActivity(req, res, callback),
            reportsCanceledMembership(req, res, callback),
            reportsDiscount(req, res, callback),
            reportsNoMembership(req, res, callback),
            reportsRevenus(req, res, callback),
            reportsSolidMembership(req, res, callback),
            reportsSubscribedMembers(req, res, callback),
            reportsUsers(req, res, callback)
        reportsStaff(req, res, callback)

    }]
        , function (err, result) {

            if (err) throw (err)
            callback(result)

        })
}
//users by branch 
function usersByBranch(req, res, callback) {
    var where = {
        $or: [
            { branch_key: req.query.parent_key },
            { club_key: req.query.parent_key },

        ]
    }
    var usersCallback = function (result) {
        callback(result)
    }
    baseModel.getJoinWithGroup(req, res, membershipandpayments, 'usermetas', 'branch_key', 'pub_key', usersCallback, where)
}

function getAgendaClub(req, res, callback) {
    var where = {
        $or: [
            { 'branch_key': req.query.parent_key },
            { 'club_key': req.query.parent_key },
            { 'units_key': req.query.parent_key },
        ]
    }
    //

    var attendanceCallback = function (result) {
        callback(result)
    }
    attendanceCrl.getreportsattendance(req, res, where, attendanceCallback)
}

function getGeoMemberTarnsaction(req, res, callback) {

    var where = { 'usermetas.key': { $in: ['lang', 'lat', 'city', 'country'] } }
    filterTime(where, req);
    var usersCallback = function (result) {
        callback(result)
    }
    baseModel.databaseSumOperations(req, res, membershipandpayments, 'fees', usersCallback, {}, { branch_country: '$branch_country' })

}

function getGeoRefundTarnsaction(req, res, callback) {

    var where = { 'usermetas.key': { $in: ['lang', 'lat', 'city', 'country'] } }
    filterTime(where, req);
    var refundcallback = function (result) {
        if (result.length > 0) {
            console.log(result)
            resul = []
            resu = { branch_city: '', branch_country: '', status: '', refund: '' }
            result.forEach(elem => {
                if (elem['_id']) {
                    resu.branch_city = elem['_id']['branch_city']
                    resu.branch_country = elem['_id']['branch_country']
                    resu.status = elem['_id']['status']
                    resu.refund = elem['total']
                    resul.push(resu)
                }
            })
            callback({ 'result': true, 'data': resul })
        }

    }
    baseModel.databaseSumOperations(req, res, membershipandpayments, 'payment_refund', refundcallback, {}, { branch_country: '$branch_country' })

}
function getGeoRevenusTarnsaction(req, res, callback) {

    var where = { 'usermetas.key': { $in: ['lang', 'lat', 'city', 'country'] } }
    filterTime(where, req);
    var revenuscallback = function (result) {
        if (result.length > 0) {
            console.log(result)
            resul = []
            resu = { branch_city: '', branch_country: '', status: '', revenus: '' }
            result.forEach(elem => {
                if (elem['_id']) {
                    resu.branch_city = elem['_id']['branch_city']
                    resu.branch_country = elem['_id']['branch_country']
                    resu.status = elem['_id']['status']
                    resu.revenus = elem['total']
                    resul.push(resu)
                }
            })
            callback({ 'result': true, 'data': resul })
        }
    }
    baseModel.databaseSumOperations(req, res, membershipandpayments, 'fees', revenuscallback, {}, { branch_country: '$branch_country' })

}


function logClubTransactionwithBranchDetails(req, res, callback) {
    req.query.club_key=req.query.parent_key;
    var reportsCallback = function (result) {
        if (result) {
            if (result.length > 0) {
                PubkeyBranchArr = []
                result.forEach(element => {
                    if (element.branch) {
                        PubkeyBranchArr.push(element.branch)
                    }
                });
                if (PubkeyBranchArr.length > 0) {
                    //callback of branch data
                    var callBackBranchData = function (result1) {
                        let transactionWithBranchDetails = [];

                        for (let i = 0; i < result.length; i++) {
                            transactionWithBranchDetails.push({
                                ...result[i],
                                ...(result1.find((itmInner) => itmInner.branch === result[i].branch))
                            }
                            );
                        }
                        callback({result:true,data:transactionWithBranchDetails})
                    }

                    //condition to get the branch by pub key

                    var where = { 'pub_key': { '$in': PubkeyBranchArr }, 'key': { '$in': ['country', 'city', 'lang', 'lat'] } }
                    user.getDataOfAccountsBypubKeyarr(req, res, where, callBackBranchData, 'pub_key')
                }
                else{
                    callback({result:true,data:[]})
                }
            }

            else{
                callback({result:true,data:[]})
            }
        }
        else{
            callback({result:true,data:[]})
        }

    }
    log.reportClubTransations(req, res, false, reportsCallback)
}



module.exports = {
    logClubTransactionwithBranchDetails,
    totalReports, reportsActivity,
    reportsCanceledMembership,
    reportsDiscount,
    reportsNoMembership,
    reportsRevenus,
    reportsSolidMembership,
    reportsSubscribedMembers,
    reportsUsers,
    reportsAttendance,
    refundReports,
    getprofitShare,
    usersByBranch,
    getAgendaClub,
    getGeoRefundTarnsaction,
    getGeoRevenusTarnsaction,
    reportsStaff,
    getGeoMemberTarnsaction
}

function calcDays(range) {
    date = new Date();
    date = new Date(date.setDate(date.getDate() - range));
    return date
}




function filterTime(where, req) {
    end = new Date()
    start = calcDays(7)
    where.createdat = { $lte: end, $gte: start }
    //rangeTime
    if (req.body.rangeTime) {
        end = new Date()
        start = calcDays(req.body.rangeTime)
        where.createdat = { $lte: end, $gte: start }
    }
    //rangeDate
    else if (req.body.rangeDate) {
        if (req.body.rangeTime.date.start && req.body.rangeTime.date.end)
            where.createdat = { $lte: req.body.rangeTime.date.end, $gte: req.body.rangeTime.date.start }
    }
}