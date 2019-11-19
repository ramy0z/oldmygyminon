var express = require('express');
var router = express.Router();
var auth = require('../models/auth/auth');
const baseurl = auth.baseurl();
const host = baseurl+'customers/';
const hostoption = baseurl+'options/';
const hostprivilidge = baseurl+'privilidgetypes/';
const hostusersprivilidge = baseurl+'allprivilidges/';
const emailshost = baseurl+'emails/';

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(! req.session.user) res.redirect('/login');
  else{
     res.render('admin/dashboard',{session:req.session});
  }
});
/* GET users listing. */
router.get('/allusers', function(req, res, next) {
    var handleResponsetype=  function(type) {
      var handleResponse=  function(data1) {
        var handleResponse1 = function(data){
          res.render( 'admin/allusers' , { allusers: data.users ,allPrivilidge:data1.result,privilodgeType:type.result,session:req.session});
        }
        if(req.session.user.type == 'xsa' || req.session.user.type == 'sa') auth.axiosget(req,res,host+'getallusers',handleResponse1);
        else auth.axiosget(req,res,host+'getallusersclub',handleResponse1);
      }
      req.body.key = req.session.parent_key;
      auth.axiospost(req,res,hostusersprivilidge+'getUsersPrivilidge',req.body,handleResponse);
    }
    //get privilidge type
    auth.axiosget(req,res,hostprivilidge+'PrivilidgeType',handleResponsetype);
});
/* GET users Types. */
router.get('/userstype', function(req, res, next) {

    var handleResponse = function(data){
      res.render( 'admin/userstype' , { allTypes: data.variables ,session:req.session});
    }
    auth.axiosget(req,res,host+'getUsersType',handleResponse);
});
/* GET users Privilidge. */
router.post('/upgradetoclub', function(req, res, next) {

    var handleResponse = function(data){
      req.session.user.acounts.push({key:req.query.public_key,value:'xadmin'});
      req.session.user.type='xadmin';
      res.redirect('/admin');
    }
    auth.axiospost(req,res,host+'upgradetoclub',req.body,handleResponse);
});
/***  privilidege Route */
    /* GET users Privilidge. */
    router.get('/privilidgetype', function(req, res, next) {
        var handleResponse = function(data){
          var handleResponse1 = function(data1){

            res.render( 'admin/privilidgetype' , { allTypes: data1.result ,allPrivilidge: data.result ,session:req.session});
          }
          auth.axiosget(req,res,hostprivilidge+'PrivilidgeType',handleResponse1);
        }
        req.body.key = req.session.parent_key;
        auth.axiospost(req,res,hostusersprivilidge+'getUsersPrivilidge',req.body,handleResponse);
    });
    /* Post All Usres Privilidge Types. */
    router.post('/privilidgetype', function(req, res, next) {
        var handleResponse = function(data){
          res.redirect( 'privilidgetype');
        }

      auth.axiospost(req,res,hostprivilidge+'PrivilidgeType',req.body,handleResponse);
    });
    /* Update users Privilidge. */
    router.post('/privilidgetype/:id', function(req, res, next) {
        var handleResponse = function(data){
          res.redirect( '/admin/privilidgetype');
        }
      auth.axiospost(req,res,hostprivilidge+'PrivilidgeType/'+req.params.id,req.body,handleResponse,'patch');
    });
    /* Delete users Privilidgen  Types. */
    router.get('/privilidgetype/:id', function(req, res, next) {
      var handleResponse = function(data){
        res.redirect( '/admin/privilidgetype');
      }
      auth.axiospost(req,res,hostprivilidge+'PrivilidgeType/'+req.params.id,req.body,handleResponse,'delete');
    });
/**** End privilidege Route */

/***  privilidege Type Route */
    /* GET users Privilidge. */
    router.get('/usersprivilidge', function(req, res, next){
      var handleResponsetype=  function(type) {
        var handleResponse = function(data){
          var handleResponse1 = function(data1){

            res.render( 'admin/usersprivilidge' , { usersPrivilidge: data1.result ,allPrivilidge:data.result,privilodgeType:type.result,session:req.session});
          }
          auth.axiosget(req,res,hostusersprivilidge+'getAllUsersPrivilidge',handleResponse1);
        }

        req.body.key = req.session.parent_key;
        auth.axiospost(req,res,hostusersprivilidge+'getUsersPrivilidge',req.body,handleResponse);
      }
      //get privilidge type
      auth.axiosget(req,res,hostprivilidge+'PrivilidgeType',handleResponsetype);
    });
    /* Add  users Privilidge. */
    router.post('/usersprivilidge', function(req, res, next) {
        var handleResponse = function(data){
          res.redirect( 'usersprivilidge');
        }
      auth.axiospost(req,res,hostusersprivilidge+'UsersPrivilidge',req.body,handleResponse);
    });
    /* Update users Privilidge. */
    router.post('/usersprivilidge/:id', function(req, res, next) {
        var handleResponse = function(data){
          res.redirect( '/admin/usersprivilidge');
        }
      //auth.axiospost(req,res,hostusersprivilidge+'UsersPrivilidge/'+req.params.id,req.body,handleResponse,'patch');
    });
    /* Delete users Privilidgen. */
    router.get('/usersprivilidge/:id', function(req, res, next) {
      var handleResponse = function(data){
        res.redirect( '/admin/usersprivilidge');
      }
      auth.axiospost(req,res,hostusersprivilidge+'UsersPrivilidge/'+req.params.id,req.body,handleResponse,'delete');
    });

/*** User Privilidge */
/*** Subscribe And Subscribe ***/
/* GET users Privilidge. */
router.get('/unsubscribetoclub/:id', function(req, res, next){
  var handleResponse = function(data){
    res.redirect( '/admin/allusers');
  }
  auth.axiospost(req,res,host+'unsubscribetoclub/'+req.params.id,req.body,handleResponse,'delete');
});

router.get('/changeaccount/:id', function(req, res, next){
  req.session.user.parent_key = req.params.id;
  var handleResponse = function(data){
    if(! data.result) data.result={};
    req.session.user.allPrivilidge=data.allPrivilidge;
    res.redirect( '/admin');
  }
  auth.axiosget(req,res,host+'changeaccount/'+req.params.id,handleResponse);
});
//send user invitations
router.get('/invitations', function(req, res, next){
  var handleResponse = function(branch){
     var handleResponse1 = function(data){
       var code='';
       if(req.query.code === '-1') code = 'You Send This Email Before !';
       else if(req.query.code === '-2') code = 'This User Already In Your Contacts';
       else if(req.query.code === '0') code = 'Un Know Error Occured';
       else if(req.query.code === '1') code = 'Invitation send Successfully';
       res.render('admin/invitations',{session:req.session,invitations:data.result,branch:branch.users,code:code});
    }
    auth.axiosget(req,res,emailshost+'getEmails/',handleResponse1);
  }
  auth.axiosget(req,res,host+'getAllBranchAndUnits/',handleResponse);
});
//send user invitations
router.post('/invitations', function(req, res, next){

   var handleResponse = function(data){
     res.redirect('/admin/invitations?code='+data.result);
  }
  auth.axiospost(req,res,host+'invitation/',req.body,handleResponse,'post');
});
//resend user invitations
router.get('/resendinvitation/:email', function(req, res, next){

   var handleResponse = function(data){
     console.log(data);
     res.redirect('/admin/invitations/?resend=true');
  }
  auth.axiosget(req,res,host+'resendinvitation/'+req.params.email,handleResponse);
});
//delete invitations
router.get('/deleteinvitation/:id', function(req, res, next){
  var handleResponse = function(data){
    res.redirect( '/admin/invitations');
  }
  auth.axiospost(req,res,emailshost+'deleteEmails/'+req.params.id,req.body,handleResponse,'delete');
});

/* GET users settings. */
router.get('/settings', function(req, res, next) {
  var handleResponse = function(result){
     res.render('admin/settings',{session:req.session,settings:result.result});
  }
  auth.axiosget(req,res,hostoption+'getAllSettings/',handleResponse);
});
//update settings
router.post('/updatesettings', function(req, res, next){
  var handleResponse = function(data){
    res.redirect( '/admin/settings');
  }
  auth.axiospost(req,res,hostoption+'updatesettings/',req.body,handleResponse,'patch');
});
module.exports = router;
