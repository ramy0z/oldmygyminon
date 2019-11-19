var express = require('express');
var router = express.Router();
var membership = require('../../../controller/membershipCrl');
var auth = require('../../../models/auth/auth');
var ObjectId = require('mongodb').ObjectID;


/* GET api listing. */
//add membership
router.post('/addPackages', function(req, res, next) {

  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true});
      else res.send({result:false});
    }
    membership.addPackages(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'addmembership',true);
});
//update membership
router.patch('/updatePackages/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    membership.updatePackages(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'editmembership',true);
});
//get all memberships
router.delete('/deletePackages/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      res.send({result:result});
    }
    membership.deletePackages(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'deletemembership',true);
});
//get all user settings
router.get('/getPackages', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send({result,data} );
      else res.send( {result,error:data} );
    }
    var where = { $or:[
      {branch_key:req.query.parent_key},
      {club_key:req.query.parent_key},
      {units_key:req.query.parent_key}
    ],$and:[{}]}
    if(req.query.search){
      var search= req.query.search.toString();
      where['$and'].push({$or:[
                {'title':{'$regex': search }},
                {'discriptions':{'$regex': search }},
                {'type':{'$regex': search }}
              ]});
    }
    if(req.query.branch_key){
      where['$and'].push({branch_key:req.query.branch_key});
    }

    if(req.query.units_key){
      where['$and'].push({units_key:req.query.units_key});
    }

    if(req.query.type){
      where['$and'].push({type:req.query.type});
    }

    //check if membership_id
    if(req.query.membership_id){
      if(req.query.membership_id.length == 24){
        var handlepackagebyid = function(result,data){
          if(result){
            where['$and'].push({_id:{$ne:ObjectId(req.query.membership_id)}});
            if(req.query.upgrade) where['$and'].push({fees:{$gte:data[0]['fees']}});
            else if(req.query.downgrade) where['$and'].push({fees:{$lte:data[0]['fees']}});
            else res.send( {result:false,error:'invalid request params'} );
            //console.log(where['$and'][3]);
            if(req.query.upgrade || req.query.downgrade)
              membership.getPackages(req,res,where,{},handelresult);
          }else res.send( {result,error:data} );
        }
        membership.getPackages(req,res,{_id:ObjectId(req.query.membership_id)},{},handlepackagebyid);
      }else res.send( {result:false,error:'invalid membership id'} );
    }else membership.getPackages(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//get all user settings
router.get('/getPackagesById/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send({result,data} );
      else res.send( {result,error:data} );
    }
    membership.getPackages(req,res,{_id:ObjectId(req.params.id)},{},handelresult);
  }
  auth.Auth(req,res,exceresult,'getmembership',true);
});

//selecte membership
router.post('/selectePackage', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      if(! err) res.send({result:true,data:result});
      else res.send({result:false,error:err});
    }
    membership.selectePackage(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//upgrade membership
router.post('/upgradePackage', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      //console.log(result,err)
      if(! err) res.send({result:true,data:result});
      else res.send({result:false,error:err});
    }
    membership.upgradeanddowngradePackage(req,res,'upgrade',handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//downgrade membership
router.post('/downgradePackage', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,err){
      //console.log(result,err)
      if(! err) res.send({result:true,data:result});
      else res.send({result:false,error:err});
    }
    membership.upgradeanddowngradePackage(req,res,'downgrade',handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//get selecte Package
router.get('/getSelectedpackage/:pub_key', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
      if(result) res.send({result,data} );
      else res.send( {result,error:data} );
    }
    var where = { $or:[
      {'memberships.branch_key':req.query.parent_key},
      {'memberships.club_key':req.query.parent_key},
      {'memberships.units_key':req.query.parent_key},
      {'activites.branch_key':req.query.parent_key},
      {'activites.club_key':req.query.parent_key},
      {'activites.units_key':req.query.parent_key}
    ],$and:[{pub_key:req.params.pub_key}]}
    if(req.query.search){
      var search= req.query.search.toString();
      where['$and'].push({$or:[
                {'memberships.title':{'$regex': search }},
                {'start_date':{'$regex': search }},
                {'end_date':{'$regex': search }},
                {'memberships.type':{'$regex': search }},
                {'membership_status':{'$regex': search }}
              ]});
    }


    membership.getSelectedpackage(req,res,where,{},handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});


//get selecte Package
router.get('/getSelectedPackageById/:id', function(req, res, next) {
  var exceresult = function (){
    if(req.params.id.length == 24){
      var handelresult = function(result,data){
        if(result) res.send({result,data} );
        else res.send( {result,error:data} );
      }

      var where = { $or:[
        {'memberships.branch_key':req.query.parent_key},
        {'memberships.club_key':req.query.parent_key},
        {'memberships.units_key':req.query.parent_key},
        {'activites.branch_key':req.query.parent_key},
        {'activites.club_key':req.query.parent_key},
        {'activites.units_key':req.query.parent_key}
      ],$and:[{_id:ObjectId(req.params.id)}]}


      membership.getSelectedpackage(req,res,where,{},handelresult);
    }else res.send( {result:false,error:'invalid package'} );
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});
//update selecte Package
router.patch('/updateSelectedpackage/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result){
      //console.log(result)
      if(result) res.send({result:true});
      else res.send({result:false});
    }
    //modifiy the method
    membership.updateSelectedpackage(req,res,req.body,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

//update selecte Package
router.patch('/paymentPackage/:id', function(req, res, next) {
  var exceresult = function (){
    var handelresult = function(result,data){
  //console.log('result',result)
        if(result) res.send({result:true});
       else res.send({result:false,'error':data});
     }
    //modifiy the method
    membership.paymentPackage(req,res,req.body,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
});

router.post('/renewmembership/:pub_key', function(req, res, next) {
  if(req.body.id)
  {
  var exceresult = function (){
    var handelresult = function(result){
       if(result['result']) res.send(result);
       else res.send({result:false});
    }
    membership.renewmembership(req,res,handelresult);
  }
  auth.Auth(req,res,exceresult,'userbase',true);
}
else{
  res.send({result:false,data:'invalid data'})
}
});

module.exports = router;
