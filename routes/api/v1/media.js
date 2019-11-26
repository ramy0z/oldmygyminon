var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
//var sharp = require('sharp');
const path = require('path');
const appDir = path.dirname(require.main.filename);
var router = express.Router();
var auth = require('../../../models/auth/auth');
var media = require('../../../controller/mediaCrl');
const PDFDocument = require('pdfkit');
const exists = (path) => {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
};
var resize = function(width, height,image,path,imagename) {
  if(exists(image)) {
      if (!fs.existsSync(path)) fs.mkdirSync(path);
     // sharp(image).resize(width, height).toFile(path+'/'+imagename, function(err) {
 // });
}
}
const getFileExtension = (filename) => {
var resize = function(width, height,image,path,imagename) {
    if(exists(image)) {
        if (!fs.existsSync(path+"\\"+width+'×'+height)) fs.mkdirSync(path+"\\"+width+'×'+height);
        //sharp(image).resize(width, height).toFile(path+"\\"+width+'×'+height+'/'+imagename, function(err) {
    //});
  }
}
return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};
router.post('/uploadimage', function(req, res, next) {
  var exceresult = function(){
    media.upload_multiImages(req, res ,function(result){
      res.send(result);
    });
 }
 auth.Auth(req,res,exceresult,'userbase',true);
});

// router.post('/uploadimage', function(req, res, next) {
//   var exceresult = function(){
//     console.log("req.body",req)
//       var form = new formidable.IncomingForm();
//       form.parse(req, function (err, fields, files) {
//         console.log("files",files.upload);
//         var oldpath = files.upload.path;
//         var imagename = files.upload.name;
//         var exten = getFileExtension(imagename);
//         if(exten=='jpg'||exten=='jpeg'||exten=='png') imagename = imagename.replace(exten,'bmp');
//         // var year = appDir +"\\public\\uploads\\"+new Date().getFullYear();
//         // var month = year+"\\"+new Date().getMonth();
//         var year = path.join(appDir,'public','uploads',new Date().getFullYear().toString());
//         var month = path.join(year,new Date().getMonth().toString());
//         imagename = Date.now()+imagename;
//         //var newpath = newpath+"\\"+imagename;
//         var newpath = path.join(month,imagename);
//         if (!fs.existsSync(year)) fs.mkdirSync(year);
//         if (!fs.existsSync(month)) fs.mkdirSync(month);

//         var imageurl = auth.siteurl()+'/uploads/'+new Date().getFullYear()+'/'+new Date().getMonth()+'/'+imagename;
//     // Read the file
//         fs.readFile(oldpath, function (err, data) {
//             if (err) res.send({result:false,url:'',host:'',message:err});
//             // Write the file
//               fs.writeFile(newpath, data, function (err) {
//                   if (err) throw err;
//                   if(exten=='jpg'||exten=='jpeg'||exten=='png'||exten=='gif'){
//                     resize(64,64,newpath,month,imagename);
//                     resize(350,350,newpath,month,imagename);
//                     resize(800,800,newpath,month,imagename);
//                   }
//                   res.send({result:true,image:imageurl,message:'File uploaded!'});
//                   res.end();
//               });

//             // Delete the file
//             fs.unlink(oldpath, function (err) {
//                 if (err) throw err;
//             });
//         });
//    });
//  }
//  auth.Auth(req,res,exceresult,'userbase',false);
// });

//generate pdf
router.get('/generatepdf', function(req, res, next) {
  var exceresult = function(){
    res.send({result:true,url:media.generateAgreementPDF(req,res,{})});
 }
 auth.Auth(req,res,exceresult,'userbase',false);
});

module.exports = router;
