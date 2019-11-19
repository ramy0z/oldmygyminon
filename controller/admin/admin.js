var baseModel = require('../../models/baseModel');
var admin = require('../../adminModels/admin');
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var md5 = require('md5');
//create user
exports.createUser =  function(req,res,callback1){

  //generate private key and publick key
  var prime_length = 60;
  var diffHell = crypto.createDiffieHellman(prime_length);
  diffHell.generateKeys('base64');
  var pub_key = diffHell.getPublicKey('hex');
  var pri_key = diffHell.getPrivateKey('hex');
  //hash password
  if(typeof req.body.password != 'string') req.body.password='';
  var password = crypto.pbkdf2Sync(req.body.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');

  //get user main data
  var data = {
        username:req.body.username,
        password:password ,
        email:req.body.email,
        name:req.body.name,
        type:req.body.type,
        privilidge_type:req.body.privilidge_type,
        privilidge:req.body.privilidge,
        pri_key:pri_key,
        pub_key:pub_key,
        status:'active'
    }
  // call back function after user added
    var callback = function(obj,error){
        callback1(obj,error);
    }
    //add new users
   baseModel.add(req, res , admin,data,callback,true);
  }
//user regisert validation
exports.checkExistsMail =  function(req ,res,callback,pub_key=null){
    if(pub_key == null){
      var callback1 = function(result){
        if(result.length) callback({err:true,field:'username',msg:'username already exists'});
        else {
            var callback2 = function(result){
              if(result.length) callback({err:true,field:'email',msg:'email already exists'});
              else  callback({err:false,field:'',msg:''})
            }
            baseModel.get(req ,res,admin,{email:req.body.email},{},callback2);
          }
        }
      baseModel.get(req ,res,admin,{username:req.body.username},{},callback1,true);
    }else{
      var callback2 = function(result){
        if(result.length && result[0].pub_key != pub_key) callback({err:true,field:'email',msg:'email already exists'});
        else  callback({err:false,field:'',msg:''})
      }
      baseModel.get(req ,res,admin,{email:req.body.email},{},callback2);
      //baseModel.get(req ,res,admin,{email:req.body.email,pub_key:{ $nin: [req.query.public_key]}},{},callback2);
    }
  }
//user login
exports.login =  function(req,res,callback){
    var privilidge=new Array();   var allPrivilidge=new Array();
    var callback1 = function(data){
      if (data.length != 0 ) {
        const accessToken = jwt.sign({ id: data[0]._id }, req.app.get('jwt.secret'), {
          issuer: req.app.get('jwt.issuer'),
          audience: req.app.get('jwt.audience')
        });

        var user ={
          id:data[0]._id,
          username:data[0].username,
          email:data[0].email,
          name:data[0].name,
          type:data[0].type,
          pub_key:data[0].pub_key,
          allPrivilidge:data[0].privilidge,
          privilidgetype : data[0].privilidge_type,
          token:accessToken
        }

        if(typeof data[0] != 'undefined') var string1 =data[0].privilidge;else var string1='';
        if(! string1) string1='';

        for (var group in allPrivilidges) {
          if (allPrivilidges.hasOwnProperty(group)) {
            var deletegrop = true;
            Object.keys(allPrivilidges[group]).forEach(function(key) {
              deletegrop = false;
              if(! string1.includes(allPrivilidges[group][key])) delete allPrivilidges[group][key];
            });
            if(deletegrop) delete allPrivilidges[group];
          }
        }
        user['allPrivilidge']  =allPrivilidges;
        callback(true,user);

      }else{
        callback(false,{});
      }
    }
    if(typeof req.body.password != 'string') req.body.password='';
    var password = crypto.pbkdf2Sync(req.body.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');
    baseModel.get(req, res , admin,{ username : req.body.username ,  password:password ,status:'active'},{},callback1);
  }
//update user data
exports.updateUserData =  function(req,res,where,data,callback){
  var callback1 = function(obj){
    if(obj.nModified) callback(true);
    else callback(false);
  }
  if(data.password)
    data.password = crypto.pbkdf2Sync(data.password, 'gymin_docyle_product', 2048, 32, 'sha512').toString('hex');
  baseModel.update(req, res , admin,where,data,callback1,false,true);
}
//get all user
exports.getalladmins =  function(req ,res,callback1,where){
   var callback = function(obj){
     var data={
             _id : '',
             username: '',
             email: '',
             name: '',
             pub_key: '',
             privilidge: '',
             privilidge_type:{},
             status : ''
           }
           var result = new Array();
           var i=1;

           Object.keys(obj).forEach(function(key) {
             var useradmin = obj[key];
               var oneuseradmin = new Object(); oneuseradmin['increment']=i;i++;
             Object.keys(data).forEach(function(index) {
               if(useradmin[index] != undefined) oneuseradmin[index]=useradmin[index];
               else oneuseradmin[index]=data[index];
             });
             if(obj[key]['adminprivilidgetypes'].length>0)
                oneuseradmin['privilidge_type']=obj[key]['adminprivilidgetypes']
             else oneuseradmin['privilidge_type']={}
             result.push(oneuseradmin);
         });
       callback1(result);
   }
   if(req.query.search){
     var search = req.query.search.toString();
     where['$and'].push({$or:[
               {'username':{'$regex': search }},
               {'email':{'$regex': search }},
               {'name':{'$regex': search }},
               {'type':{'$regex': search }}
             ]});
   }
   //filter by status
   if(req.query.status){
     var status= req.query.status.toString();
     where['$and'].push({'status':status});
   }
   //filter by role
   if(req.query.role){
     var role= req.query.role.toString();
     where['$and'].push({'privilidge_type':role });
   }
   //filter by privilidge
   if(req.query.privilidge){
     var privilidge= req.query.privilidge.toString().split(",");
     Object.values(privilidge).forEach(function(value) {
       where['$and'].push({'privilidge':{'$regex': value }});
     });
   }

   //orderby
   //filter by privilidge
   if(req.query.orderby && req.query.order){
     if(req.query.orderby == 'id') var sort={_id:parseInt(req.query.order)}
     else if(req.query.orderby == 'username') var sort={username:parseInt(req.query.order)}
     else if(req.query.orderby == 'name') var sort={name:parseInt(req.query.order)}
     else if(req.query.orderby == 'email') var sort={email:parseInt(req.query.order)}
     else if(req.query.orderby == 'role') var sort={'adminprivilidgetypes.privilidge_type':parseInt(req.query.order)}
     else var sort = {createdat:-1};
   }
   baseModel.getJoin(req ,res,admin,'adminprivilidgetypes','privilidge_type','_id',callback,where,true,sort);
 }

 var allPrivilidges = {
   "Users Mangement": {
     "Get All Users": "getallusers",
     "Invitation": "sendinvitations",
     "Delete user": "getallusersclub",
     "Update User": "updateuserdata",
     "Get User": "getuserdata",
     "Setting": "updatesettings"
   },
   "Privilidges": {
     "Add Privilidges": "addprivilidges",
     "Edit Privilidges": "editprivilidges",
     "Get Privilidges": "getprivilidges",
     "Delete Privilidges": "deleteprivilidges"
   },
   "Roles": {
     "Add Roles": "addprivilidgestype",
     "Edit Roles": "editprivilidgestype",
     "Get Roles": "getprivilidgestype",
     "Delete Roles": "deleteprivilidgestype"
   },
   "Membership": {
     "Add Membership": "addmembership",
     "Edit Membership": "editmembership",
     "Get Membership": "getmembership",
     "Delete Membership": "deletemembership"
   },
   "Activities": {
     "Add Activities": "addactivities",
     "Edit Activities": "editactivities",
     "Get Activities": "getactivities",
     "Delete Activities": "deleteactivities"
   },
   "Resoureces": {
     "Add Resoureces": "addunitresoureces",
     "Edit Resoureces": "editunitresoureces",
     "Get Resoureces": "getunitresoureces",
     "Delete Resoureces": "deleteunitresoureces"
   },
   "Shifts": {
     "Add Shifts": "addshifts",
     "Edit Shifts": "editshifts",
     "Get Shifts": "getshifts",
     "Delete Shifts": "deleteshifts"
   }
 }
