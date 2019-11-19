const express = require('express')
const route = express.Router();
const attendance = require('../../../../controller/attendanceCrl')
const auth = require('../../../../models/auth/auth')
const membership = require('../../../../controller/membershipCrl')
const basemodel = require('../../../../models/baseModel')
const mongosse = require('mongoose')
const objectId = mongosse.Types.ObjectId
//used to get the member attendances 
route.post('/getAttendance/:pub_key', (req, res) => {
    auth.Auth(req, res, () => {
        console.log('aa', req.body)
        if (req.params.pub_key) {
            where = {};

            var totalPages = 0;
            //filter membershipandpayments id
            if (req.body.membershipandpayment_id) {
                console.log(typeof req.body.membershipandpayment_id)
                if (req.body.membershipandpayment_id.length > 0) {
                    where = { membershipandpayment_id: {} }
                    where['membershipandpayment_id']['$in'] = req.body.membershipandpayment_id
                }
                // where.membershipandpayment_id = 
            }
            //filter club key
            if (req.body.club_key)
                where.club_key = req.body.club_key
            //filter branch
            if (req.body.branch_key)
                where.branch_key = req.body.branch_key
            //filter units
            if (req.body.units_key)
                where.units_key = req.body.units_key
            where.user_key = req.params.pub_key
            req.body.startDay = FormatDate(req.body.startDay)
            req.body.endDay = FormatDate(req.body.endDay)
            if (req.body.startDay && req.body.endDay) {
                where.day = { $gte: req.body.startDay, $lte: req.body.endDay }
                if (typeof req.body.perpage == 'undefined')
                    req.body.perpage = 1000000
            }
            else if (req.body.endDay) {
                where.day = { $lte: req.body.endDay }
                if (typeof req.body.perpage == 'undefined')
                    req.body.perpage = 1000000
            }

            else if (req.body.startDay) {
                where.day = { $gte: req.body.startDay }
                if (typeof req.body.perpage == 'undefined')
                    req.body.perpage = 1000000
            }
            if (typeof req.body.perpage == 'undefined')
                req.body.perpage = 1000000
            console.log(where)
            attendance.getreportsattendance(req, res, where, function (result) {
                //if(typeof req.body.perpage == 'undefined') req.body.perpage=30
                console.log(req.body.perpage)
                totalPages = Math.ceil(parseInt(result.totalItem) / parseInt(req.body.perpage))
                res.setHeader('total_pages', totalPages);
                res.setHeader('items', result.totalItem);
                res.setHeader('items_perpage', req.body.perpage);
                setTimeout(function () { res.send({ 'result': true, 'data': result.data }) }, 2500);

            })
        }
        else {

            res.send({ 'result': false, data: 'invalid user' })
        }
    }, 'memberbase', true)
});


route.post('/getAttendanceDetails/:membershipandpayments_id', (req, res) => {
    auth.Auth(req, res, () => {

        if (req.params.membershipandpayments_id) {
            where = {};
            var totalPages = 0;
            //console.log(req.body.day)
            //    where['attendances']['_id'] = objectId(req.params._idAttendances)
            try {
                where['_id'] = objectId(req.params.membershipandpayments_id)

                // if()
                membership.getattendanceDetails(req, res, where, function (result) {
                    //if(typeof req.query.perpage == 'undefined') req.query.perpage=30
                    // console.log(req.query.perpage)
                    // totalPages=Math.ceil(parseInt(result.totalItem)/parseInt(req.query.perpage))
                    // res.setHeader('total_pages', totalPages);
                    // res.setHeader('items', result.totalItem);
                    // res.setHeader('items_perpage',req.query.perpage);
                    setTimeout(function () { res.send({ 'result': true, 'data': result }) }, 2500);

                })
            }
            catch{
                res.send({ 'result': false, data: 'invalid memberships' })
            }
        }
        else {

            res.send({ 'result': false, data: 'invalid memberships' })
        }
    }, 'memberbase', true)
});


function FormatDate(timestamp) {
    if (parseInt(timestamp)) {
        console.log('aaaaaaaaa', timestamp)
        return new Date(parseInt(timestamp)).toISOString().slice(0, 10)
    }
    else return null
}
module.exports = route;


route.post('/getattendanceofmemberships/:pub_key', (req, res) => {
    auth.Auth(req, res, () => {


        var membershipcallback = function (result) {
            res.send({ result: true, data: result })
        }

        membership.getattendanceofmemberships(req, res, {}, membershipcallback)

    }, 'memberbase', true)
});


route.post('/attendanceCheckin', (req, res) => {
    auth.Auth(req, res, () => {
        if (req.body.checkin) {
            var membershipcallback = function (result) {
                res.send(result)
            }
        }
        else {
            res.send({ result: true, data: 'checkin date is required' })
        }

        attendance.updateattendanceandcheckin(req, res, membershipcallback)

    }, 'memberbase', true)
});

route.post('/upcomingsession', (req, res) => {
    auth.Auth(req, res, () => {

            var membershipcallback = function (result) {
                res.send(result)
            }
        


        attendance.getupcomingattendance(req, res,{}, membershipcallback)

    }, 'memberbase', true)
});
