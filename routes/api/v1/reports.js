var express=require('express')
var router=express.Router();
var auth = require('../../../models/auth/auth');
// var auth = require('../../../models/auth/auth');
var reportsCrl=require('../../../controller/reportsCrl')



router.get('/getreports',function(req,res){
 
  element=[];  
  //the number of repots method
  var num=9;
  var callback=function (result)
  {  
    element.push(result)
   if(num>1)
   { 
     --num;
   
   }
   else
   {
    var resu = {};
    console.log('arr',element)
    for (var i = 0; i < element.length; i++) {
      
      resu[Object.keys(element[i])] =Object.values(element[i])[0]
      console.log(resu)
    }
    
      res.send({'result':resu})
   }
  }
  

  reportsCrl.totalReports(req,res,callback)

})

router.post('/reportsSolidMembership',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //

  reportsCrl.reportsSolidMembership(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);
 
})


router.post('/reportsUsers',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where
 
  reportsCrl.reportsUsers(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})

router.get('/logClubTransactionwithBranchDetails',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where
 
  reportsCrl.logClubTransactionwithBranchDetails(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})



router.post('/reportsSubscribedMembers',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }

  reportsCrl.reportsSubscribedMembers(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})


router.post('/getGeoRefundTarnsaction',function(req,res,callback){
  var exceresult = function (){
    var callback=function(result){
      res.send(result)
    }
    reportsCrl.getGeoRefundTarnsaction(req,res,callback)
  }
  auth.Auth( req,res,exceresult,'userbase',true);
})

router.post('/getGeoRevenusTarnsaction',function(req,res,callback){
  var exceresult = function (){
    var callback=function(result){
      res.send(result)
    }
    reportsCrl.getGeoRevenusTarnsaction(req,res,callback)
  }
  auth.Auth( req,res,exceresult,'userbase',true);
})

router.post('/getGeoMemberTarnsaction',function(req,res,callback){
  var exceresult = function (){
    var callback=function(result){
      res.send({'result':result})
    }
    reportsCrl.getGeoMemberTarnsaction(req,res,callback)
  }
  auth.Auth( req,res,exceresult,'userbase',true);
})

router.post('/reportsStaff',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }

  reportsCrl.reportsStaff(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})

router.post('/reportsRevenus',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where

  reportsCrl.reportsRevenus(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})


router.post('/reportsNoMembership',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where

  reportsCrl.reportsNoMembership(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})

router.post('/reportsDiscount',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where

  reportsCrl.reportsDiscount(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})

router.post('/reportsCanceledMembership',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where

  reportsCrl.reportsCanceledMembership(req,res,callback)
}
auth.Auth( req,res,exceresult,'userbase',true);

})

router.post('/reportsActivity',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send(result)
  }
  //where

  reportsCrl.reportsActivity(req,res,callback)
}
  auth.Auth( req,res,exceresult,'userbase',true);

})


router.post('/reportsAttendance',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send({'result':result})
  }
  //where
 
    //'status':{$nin:['pending-payment','active','schedule','cancel']},
   
  
  reportsCrl.reportsAttendance(req,res,callback)
}
  auth.Auth( req,res,exceresult,'userbase',true);
})


router.post('/getprofitShare',function(req,res)
{
  var exceresult = function (){
    element=[];  
    //the number of repots method
    var num=3;
    var callback=function (result)
  {  
    element.push(result)
   if(num>1)
   { 
     --num; 
   }
   else
   {
    var resu = {};
    console.log('arr',element)
    for (var i = 0; i < element.length; i++) {
      
      resu[Object.keys(element[i])] =Object.values(element[i])[0]
      console.log(resu)
    }
    
      res.send({'result':resu})
   }
  }
  reportsCrl.getprofitShare(req,res,callback)
}
  auth.Auth( req,res,exceresult,'userbase',true);
})

router.post('/refundReports',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send({'result':result})
  } 
  reportsCrl.refundReports(req,res,callback)
}
  auth.Auth( req,res,exceresult,'userbase',true);
})


//
router.post('/getAgendaClub',function(req,res)
{
  var exceresult = function (){
  var callback=function(result){
    res.send({'result':result})
  } 
  reportsCrl.getAgendaClub(req,res,callback)
}
  auth.Auth( req,res,exceresult,'userbase',true);
})

router.post('/getusersByBranch',function(req,res){
  var exceresult = function (){
    var callback=function(result){
      res.send({'result':result})
    } 
    reportsCrl.usersByBranch(req,res,callback)
  }
    auth.Auth( req,res,exceresult,'userbase',true);
})
module.exports = router;