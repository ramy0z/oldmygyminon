var baseModel = require('../models/baseModel');
var auth = require('../models/auth/auth');
var workoutsModel = require('../models/membership/workouts');
var attendanceworkoutsModel = require('../models/membership/attendanceworkouts');
const mediaCrl = require('./mediaCrl');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


exports.addWorkouts = function(req,res,callback){
    //club_key ,category ,name ,description ,image_url ,video
    console.log(req.body);
    var club_key = req.body.club_key;
    var category = req.body.category;
    var name = req.body.name;
    var description = req.body.description;
    var image_url = (req.body.image_url != undefined) ? req.body.image_url.split(auth.siteurl())[1] : "";//req.body.image.split(auth.siteurl())[1]
    var video_url = (req.body.video_url != undefined) ? req.body.video_url : "";
    
    if (club_key == undefined || category == undefined || name == undefined || description == undefined) {
        var message = "Invalid Or Missing : ";
        message += (club_key == undefined) ? " Club_key .." : "";
        message += (category == undefined) ? "  Category .." : "";
        message += (name == undefined) ? " Name .." : "";
        message += (description == undefined) ? " Description" : "";
        resultObj = { result: false, data: message };
        callback(resultObj);
    }
    else {
        var data = {
            "club_key": club_key, "category": category,
            "name": name, "description": description,
            "image_url": image_url, "video_url": video_url,
        };
        baseModel.add(req, res, workoutsModel, data, function (obj ,error) {
            if (error) callback({result:false,data: "Error While Adding Data!"});
            else callback( {result : true,  data:obj} );
        }, true);
    }
}
exports.getClubWorkouts = function(req,res,callback){
    var club_key = req.body.club_key;
    if (club_key == undefined) {
        var message = "Invalid Or Missing : ";
        message += (club_key == undefined) ? " Club_key " : "";
        resultObj = { result: false, data: message };
        callback(resultObj);
    }
    else {
        where = { club_key: club_key };
        select={_id:1 ,category:1,name:1,description:1,image_url:1,video_url:1};
        sort={ category:1 , name:1  };
        //select = {};
        baseModel.get(req, res, workoutsModel, where, select, function (obj , error) {
            if (error) callback({result:false,data: "Error While Getting Data!"});
            else {
              const unique = [...new Set(obj.map(item => item.category))];
                callback( {result : true,  data:{ "workout":obj , "category":unique , "url": auth.siteurl() } } );
            }
        }, true ,sort);
    }
}
exports.getClubWorkoutsGroupedCat = function(req,res,callback){
  var club_key = req.body.club_key;
  if (club_key == undefined) {
      var message = "Invalid Or Missing : ";
      message += (club_key == undefined) ? " Club_key " : "";
      resultObj = { result: false, data: message };
      callback(resultObj);
  }
  else {
      where = { club_key: club_key };
      select={_id:1 ,category:1,name:1,description:1,image_url:1,video_url:1};
      sort={ category:1 , name:1  };
      //select = {};
      baseModel.get(req, res, workoutsModel, where, select, function (obj , error) {
          if (error) callback({result:false,data: "Error While Getting Data!"});
          else {
              var objectGroupedCat={};
              obj.forEach(element => {
                  console.log(element);
                
                  cat= element["category"];
                  if(typeof(objectGroupedCat[cat])=="undefined")objectGroupedCat[cat]=[];
                  objectGroupedCat[cat].push(element);
              });
              callback( {result : true,   data:{ "workout":objectGroupedCat , "url": auth.siteurl() }} );
          }
      }, true ,sort);
  }
}
exports.getWorkoutsWith_id = function(req,res,callback){
  var workouts_id =req.params.id;
  console.log(req.params)
  if (workouts_id == undefined) {
      var message = "Invalid Or Missing : ";
      message += (workouts_id == undefined) ? " WorkOut ID " : "";
      resultObj = { result: false, data: message };
      callback(resultObj);
  }
  else {
      where = { _id: workouts_id };
      select={_id : 0 , category:1,name:1,description:1,image_url:1,video_url:1};
      sort={ category:1 , name:1  };
      baseModel.get(req, res, workoutsModel, where, select, function (obj , error) {
          if (error) callback({result:false,data: "Error While Getting Data!"});
          else {
              callback( {result : true,  data:obj} );
          }
      }, true);
  }
}
exports.updateWorkouts = function(req,res,callback){
  if(req.body.image_url)req.body.image_url = req.body.image_url.split(auth.siteurl())[1];
  baseModel.updateoradd(req,res,workoutsModel,{_id:req.params.id},req.body,function(obj , error){
    if(obj.n) callback( {result : true , data: "Data Updated Successfully."} );
    else callback({result : false , data: "Error While Updating Data!"});
  },true);
}
exports.deleteWorkouts = function(req,res,callback){
  if(req.body.image_url){//remove old first
    mediaCrl.delete_old_images(req.body.image_url); 
  }
  baseModel.delete(req,res,workoutsModel,{_id:req.params.id},function(obj , error){
    if(obj.n) callback( {result : true , data: "Data Deleted Successfully."} );
    else callback({result : false , data: "Error While Deleteing Data!"});
  },false,true);
}

exports.giveAttendanceWorkouts = function (req, res, callback) {
  // check data come from frontend
  var author_key = req.body.author_key;
  var workoutsArr_ids = req.body.workoutsArr_ids;
  workoutsArr_ids =workoutsArr_ids.substring(1);
  workoutsArr_ids =workoutsArr_ids.substring(0, workoutsArr_ids.length - 1);
  workoutsArr_ids = workoutsArr_ids.split(",");
  var attendance_id = req.body.attendance_id;
  if (author_key == undefined || typeof(workoutsArr_ids) == "undefined" || attendance_id == undefined) {
    var message = "Invalid Or Missing : ";
    message += (author_key == undefined) ? " Author Key " : "";
    message += (attendance_id == undefined) ? " Attendance ID " : "";
    message += (workoutsArr_ids == undefined ||workoutsArr_ids.length == 0 ) ? " Workouts Data " : "";
    resultObj = { result: false, data: message };
    callback(resultObj);
  }
 
  else {
    //conver id strings to arr of object_Id
    workoutsArr_idsArrObjects=[];
    workoutsArr_ids.forEach(element => {workoutsArr_idsArrObjects.push(ObjectId(element.trim()));});
    baseModel.updateoradd(req, res, attendanceworkoutsModel, {"attendance_id":ObjectId(attendance_id)},{"author" : author_key ,"workouts_ids":workoutsArr_idsArrObjects} , function(InsertResult , error){
      if (error) callback({result :false, error});
      else callback({result : true, data:InsertResult});
    },true);
  }
}
//check if string is valid json
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
