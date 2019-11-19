var express = require('express');
var fs = require('fs');
const path = require('path');
var router = express.Router();
var auth = require('../models/auth/auth');
const PDFDocument = require('pdfkit');

var formidable = require('formidable');
var sharp = require('sharp');
const appDir = path.dirname(require.main.filename);
const exists = (path) => {
  try {
      return fs.statSync(path).isFile();
  } catch (e) {
      return false;
  }
};

exports.generateAgreementPDF = function(req,res,agreement){
 
    // Create a document
    //const doc = new PDFDocument;
    var pdf = require('html-pdf');
    var pdfname = Date.now()+'agreement.pdf';
    //doc.pipe(fs.createWriteStream('public/pdf/'+pdfname));
    global.html = fs.readFileSync('public/template/agreement_style1.html','UTF8');
    global.html = global.html.replace('USERNAME','hassan');
    global.html = global.html.replace('AgreementDate',agreement['start_date']);
   
    // Embed a font, set the font size, and render some text
    // doc.fontSize(25)
    //    .text(html, 100, 100);
    // process.stdout.on('error', function( err ) {
    //   if (err.code == "EPIPE") process.exit(0);
    //     try {
    //       var options = { format: 'Letter' };
    //       pdf.create(global.html, options).toFile('public/pdf/'+pdfname, function(err, res) {
    //         if (err) return console.log(err);
    //       });
    //       doc.end();  
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   });
    var options = { format: 'Letter' };
    const doc = new PDFDocument(options);
    let out = fs.createWriteStream('public/pdf/'+pdfname);
    doc.pipe(out);
    global.html = fs.readFileSync('public/template/agreement_style1.html','UTF8');
   // global.html = global.html.replace('USERNAME','hassan');
    changeData(agreement)
    //global.html = global.html.replace('AgreementDate',agreement['start_date']);
    out.on('finish', function() {
   
       pdf.create(global.html, options).toFile('public/pdf/'+pdfname, function(err, res) {
         if (err) return console.log(err);
       });
    });
    doc.end();
    
    var url = auth.siteurl()+'/pdf/'+pdfname;
    return url;

}
function changeData(obj)
{
  Object.keys(obj).forEach(function (key) {
    global.html=global.html.replace(key,obj[key]);
  })
}

var resize = function (width, height, image, path, imagename) {
  if (exists(image)) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
    // pass only width in resize to keep inspect ratio same  
    sharp(image).resize(width).toFile(path + '/' + imagename, function (err) {
    });
  }
}
const getFileExtension = (filename) => {
  var resize = function (width, height, image, path, imagename) {
    if (exists(image)) {
      if (!fs.existsSync(path + "\\" + width + '×' + height)) fs.mkdirSync(path + "\\" + width + '×' + height);
      sharp(image).resize(width, height).toFile(path + "\\" + width + '×' + height + '/' + imagename, function (err) {
      });
    }
  }
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};
exports.upload_multiImages = function (req, res, callback) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log(fields);
    if ( Object.keys(files).length === 0 && files.constructor === Object) {
      callback({ result: false, data: "invaild Or Empty Image!" });
    }
    else if ( files['upload'] == undefined) {
      callback({ result: false, data: "invaild Or Empty Image!" });
    }
    else {
      var old_image_path = (fields.old_image != '') ? fields.old_image : '';
      var oldpath = files.upload.path;
      var imagename = files.upload.name;
      var exten = getFileExtension(imagename);
      if (exten == 'jpg' || exten == 'jpeg' || exten == 'png') imagename = imagename.replace(exten, 'bmp');
      // var year = appDir +"\\public\\uploads\\"+new Date().getFullYear();
      // var month = year+"\\"+new Date().getMonth();

      imagename = Date.now().toString() +imagename;//
      //var newpath = newpath+"\\"+imagename;

      var monthpath = path.join(appDir, 'public', 'uploads', new Date().getFullYear().toString(), new Date().getMonth().toString());
      if (!fs.existsSync(monthpath)) fs.mkdirSync(monthpath);
      var newpath = path.join(monthpath, imagename);

      var pathsm = path.join(appDir, 'public', 'sm', 'uploads', new Date().getFullYear().toString(), new Date().getMonth().toString());
      var pathmd = path.join(appDir, 'public', 'md', 'uploads', new Date().getFullYear().toString(), new Date().getMonth().toString());
      var pathlg = path.join(appDir, 'public', 'lg', 'uploads', new Date().getFullYear().toString(), new Date().getMonth().toString());
      if (!fs.existsSync(pathsm)) fs.mkdirSync(pathsm, { recursive: true });
      if (!fs.existsSync(pathmd)) fs.mkdirSync(pathmd, { recursive: true });
      if (!fs.existsSync(pathlg)) fs.mkdirSync(pathlg, { recursive: true });

      var imageurl = auth.siteurl() + '/uploads/' + new Date().getFullYear().toString() + '/' + new Date().getMonth().toString() + '/' + imagename;
      // Read the file
      fs.readFile(oldpath, function (err, data) {
        if (err){callback({ result: false, data: err });} 
        // Write the file
        fs.writeFile(newpath, data, function (err) {
          if (err) throw err;
          if (exten == 'jpg' || exten == 'jpeg' || exten == 'png' || exten == 'gif') {
            resize(300, 300, newpath, pathlg, imagename);//large
            resize(150, 150, newpath, pathmd, imagename);//mediam
            resize(64, 64, newpath, pathsm, imagename);//small
          }
          callback({ result: true, data: imageurl });
        });
        if(old_image_path != undefined){
          //delete old images if its exsist
          old_image_path = old_image_path.split(auth.siteurl())[1];
          delete_old_images(old_image_path);
          // Delete the file
        }
        
        fs.unlink(oldpath, function (err) {
          if (err) callback({ result: false, data:err });
        });
      });

    }
  });
}
var delete_old_images = function (old_image_path) {
  if (old_image_path != undefined) {
    try {
      var imgsubstr = old_image_path.substring(1, 3);
      if (imgsubstr != 'lg' && imgsubstr != 'md' && imgsubstr != 'sm') {
        //i have base url of image ex. /uploads/2019/10/1574075808809myimage.bmp
        fs.unlinkSync('./public' + old_image_path);
        fs.unlinkSync('./public/lg' + old_image_path);
        fs.unlinkSync('./public/md' + old_image_path);
        fs.unlinkSync('./public/sm' + old_image_path);
      } else {
        //i have sub_base url of image ex. /['lg' or 'md' or 'sm']/uploads/2019/10/1574075808809myimage.bmp
        old_image_path = old_image_path.substring(3);
        fs.unlinkSync('./public' + old_image_path);
        fs.unlinkSync('./public/lg' + old_image_path);
        fs.unlinkSync('./public/md' + old_image_path);
        fs.unlinkSync('./public/sm' + old_image_path);
      }
    } catch (error) { console.log(error) }
  }

}

exports.delete_old_images =delete_old_images;