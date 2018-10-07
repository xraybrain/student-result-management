const formidable = require('formidable');
const fs         = require('fs');
const path       = require('path');
const excel      = require('./excel-reader');


var Upload = function(dirToUpload, relativePath, options={successRedirect, failureRedirect, isResult}, User){
  this.allowedFileTypes = ['.jpg', '.jpeg', '.png', '.xlsx'];
  this.maxFileSize  = 1048576; // 1mb
  this.dirToUpload = dirToUpload;
  this.successRedirect = '/';
  this.failureRedirect = '/';
  this.totalDirFiles = 0;
  this.isResult = options.isResult;
  this.relativePath = relativePath;
  this.User = User;

  if(dirToUpload instanceof Object){
    var temp = options;
    options  = dirToUpload;
    dirToUpload = temp;
  }
  if(options instanceof Object){
    this.successRedirect = options.successRedirect;
    this.failureRedirect = options.failureRedirect;
  }
}

Upload.prototype.setAllowedFiles = function(fileTypes){
  if(fileTypes instanceof Array){
    this.allowedFileTypes = fileTypes;
  } else {
    this.allowedFileTypes.push(fileTypes);
  }

  return;
}


Upload.prototype.validateSize = function(fileSize){
  return fileSize <= this.maxFileSize;
}

Upload.prototype.isAllowedFile = function(fileName){
  var targetExtension = path.extname(fileName);
  var isOk = [];

  isOk = this.allowedFileTypes.filter(file=>{
    if(file === targetExtension){
     return file;
    }
  });

  if(isOk.length > 0) return true;

  return false;
}

//-- Validates result heading format
Upload.prototype.isResultHeadingOk = function(resultSheetHeading){
  const RESULT_SHEET_HEADING = ['SN' , 'NAME' , 'REG_NO', 'CA1', 'CA2', 'PRACTICAL', 'EXAM', 'TOTAL', 'GRADE'];

  for(var i = 0; i < RESULT_SHEET_HEADING.length; i++){
    if(RESULT_SHEET_HEADING[i] !== resultSheetHeading[i]){
      return false
    }
  }

  return true;
}

//-- uploads a normal file
Upload.prototype.upload = function(req, res, next){
  
  var form = new formidable.IncomingForm();
  var userID = req.user.id;

  form.parse(req, (errors, fields, files) => {
    var uploadOk = false;
    var error = null;
    uploadOk = this.validateSize(files.file.size);
    if(!uploadOk) error = 'Not required filesize. file must be between 100kb - 1mb';
    
  
    uploadOk = this.isAllowedFile(files.file.name);
    if(!uploadOk) error = 'File Type is not allowed';

    if(!error){
      var fileExt = path.extname(files.file.name);
      var targetPath = files.file.path;
    
      fs.readdir(this.dirToUpload, (err, dirFiles) => {
          var totalDirFiles = dirFiles.length;
          var newFileName;

          newFileName = 'xb' + (totalDirFiles + 1) + fileExt;
          
          this.relativePath = this.relativePath + newFileName;
          var newFilePath = path.join(this.dirToUpload, '/', newFileName);
          this.dirToUpload  = path.join(this.dirToUpload,'/',files.file.name);

          if(req.user.pictureDir){ 
            //-- the user already has a picture delete it
            var deleteFilePath = path.join(__dirname,'../','public',req.user.pictureDir);
            fs.unlink(deleteFilePath, (err) => {
              if (err) console.log(err);
            });
          }
          

          fs.rename(targetPath, this.dirToUpload, (err) => {
            if (err) console.log(err);

            fs.rename(this.dirToUpload, newFilePath, (err) => {
              if (err) console.log(err);
              
                this.User.findOne({_id: userID})
               .then(user => {
                 if(user){
                   user.pictureDir = this.relativePath;
                   user.save()
                     .then(user => {
                      req.flash('upload_error', 'ok');
                      res.redirect(this.successRedirect);
                     });
                 }
               })
            });

          });
        });
    } else{
      req.flash('upload_error', error);
      res.redirect(this.failureRedirect);
    }
  });
}


//-- uploads a result file
Upload.prototype.uploadResult = function(req, res, next){
  
  var form = new formidable.IncomingForm();
  // var userID = req.user.id;
  
  form.parse(req, (errors, fields, files) => {
    var uploadOk = false;
    var error = null;

    uploadOk = this.validateSize(files.file.size);
    if(!uploadOk) error = 'Not required result sheet filesize. file must be between 100kb - 1mb';
  
    uploadOk = this.isAllowedFile(files.file.name);
    if(!uploadOk) error = 'File Type is not allowed';

    if(!error){
      var fileExt = path.extname(files.file.name);
      var targetPath = files.file.path;
      var newFileName;
      var newResultName;

      newResultName = fields.course_code.toLowerCase() + '_' + fields.level + '_' + fields.academicYear + '_' + fields.session;

      //-- ensure results are uploaded once
      this.User.findOne({resultTableName: newResultName})
        .then(resultTableDetails => {
           if(resultTableDetails){
            req.flash('upload_error', 'Result already uploaded');
            res.redirect(this.failureRedirect);
           } else {
            newFileName =  newResultName + fileExt;
      
            var newFilePath = path.join(this.dirToUpload, '/', newFileName);
            
            //-- appends the filetoupload to dirToUpload
            this.dirToUpload  = path.join(this.dirToUpload,'/',files.file.name);
      
            //-- this uploads the result sheet
            fs.rename(targetPath, this.dirToUpload, (err) => {
              if (err) console.log(err);
      
              fs.rename(this.dirToUpload, newFilePath, (err) => {
                if (err) console.log(err);
                var result = {}
                
      
                var resultSheet = excel.read(newFilePath);
                result = excel.to_json(resultSheet).Sheet1;
                
                var resultSheetHeading = Object.getOwnPropertyNames(result[0]);
                //-- removes the first element of the array resultSheetHeading
                resultSheetHeading.shift();
                if(this.isResultHeadingOk(resultSheetHeading)){
                  fields.course_code = fields.course_code.toLowerCase();
                  res.render('lecturer/preview_upload', {
                    fields,
                    result,
                    fileName : newFilePath,
                    resultName :newResultName
                  });
                }else{
                  //-- delete the uploaded file
                  fs.unlink(newFilePath, (err) => {
                    if (err) console.log(err);
                  });
      
                  req.flash('upload_error', `The result sheet column headings must follow the described format which is [SN | NAME | REG_NO | CA1 | CA2 | PRACTICAL | EXAM | TOTAL | GRADE]`);
                  res.redirect('/lecturer/uploadresult');
                }
              });
      
            });
           }
        });
    } else{
      req.flash('upload_error', error);
      res.redirect(this.failureRedirect);
    }
  });
}

module.exports = Upload;