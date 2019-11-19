var express = require('express');
var router = express.Router();
var auth = require('../../../models/auth/auth');
var workouts = require('../../../controller/workoutsCrl');

// add workouts 
router.post('/add/', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.addWorkouts(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});

// get workouts and category
router.post('/getclubworkout/', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.getClubWorkouts(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});

// get workouts Grouped By category
router.post('/getclubworkoutGrouped/', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.getClubWorkoutsGroupedCat(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});
router.get('/get/:id', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.getWorkoutsWith_id(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});

//update updateworkouts
router.patch('/editworkouts/:id', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.updateWorkouts(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});

//delete updateworkouts
router.post('/deleteworkouts/:id', function (req, res, next) {
    auth.Auth(req, res, function () {
        console.log(req.body)
        workouts.deleteWorkouts(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});


router.post('/addWorkoutsToAttendance', function (req, res, next) {
    auth.Auth(req, res, function () {
        workouts.giveAttendanceWorkouts(req, res, function (result) {
            res.send(result);
        });
    }, 'userbase', true);
});

module.exports = router;
