var express =require('express');
var router =express.Router();
var membershipCrl=require('../../../../controller/membershipCrl')
const auth = require('../../../../models/auth/auth')
//filter by branch or filter by membership
router.get('/getMemberships/:id',function(req,res){
    var where={} 
    if(req.query.branch_key) where.branch_key=req.query.branch_key
   // if(req.query.type_membership) where.package_type=req.query.type_membership
    console.log(where)
    if(req.params.id)
    {
        where.pub_key=req.params.id;
    var handelresult=function(result,data)
    {
      if(result)
      {
          
          res.send({'result':true,'data':data})
      }
      else
      {
        res.send({ 'err': true, 'field': '', 'msg': 'invalid data' })
      }
    }
    membershipCrl.getSelectedpackage(req,res,where,{},handelresult);
    }
    else{
        res.send({ 'err': true, 'field': '', 'msg': 'invalid data' })
    }
})

router.get('/getClubsAndMembership/:pub_key',function(req,res){
  //console.log('jjjjjjjjjjjj')
  
  auth.Auth(req, res,() => {
    membershipCrl.getMebershipOfMember(req,res,{'pub_key':req.params.pub_key},(result)=>{
    res.send(result)
  })
  },'memberbase', true)
})


router.post('/getActivities/:id',function(req,res){
  auth.Auth(req, res,() => {
  var where={} 
  if(req.params.id)
  {
   where.pub_key=req.params.id;
  var handelresult=function(data)
  {
        res.send({'result':true,'data':data})
  }
  membershipCrl.getActivities(req,res,handelresult);
  }
  else{
      res.send({ 'result': false, 'data': 'invalid user'})
  }
},'memberbase', true)
})




module.exports = router