'use strict';
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');


const {ensureAuthenticated, ensureIsAdmin} = require('../utils/auth');

const {buildResultSchema, buildSchemaDoc, buildModel} = require('../utils/ModelBuilder');

// require resultslog model
require('../models/ResultsLog');
const  ResultsLog = mongoose.model('resultslog');

//-- Load the compositesheetlog model
require('../models/CompositeSheetLog');
const CompositeSheetLog = mongoose.model('compositesheetlog');

//-- Load the Student model
require('../models/Student');
const Student = mongoose.model('students');

const validator = require('../utils/validate');

//--
const Compute = require('../utils/Compute');


//-- Load admin schema
require('../models/Admin');
const Admin = mongoose.model('admin');

//-- 
var Uploader = require('../utils/Uploader');

//-- **********************************************
//-- Login route
router.get('/login', (req, res) => {
  res.render('admin/login');
});

//-- **********************************************
//-- Process Login
router.post('/login', (req, res, next) => {
  //-- passport Config
  require('../config/passport')(passport,Admin);
 
  passport.authenticate('local', {
    successRedirect: '/admin/',
    failureRedirect: '/admin/login',
    failureFlash: true,
    session: true
  })(req, res, next);
  
});

//-- **********************************************
//-- Signup route
router.get('/signup', (req, res) => {
  res.render('admin/signup');
});

//-- **********************************************
//-- Process Signup
router.post('/signup', (req, res) => {
  let errors = [];

  if(!validator.isRealName(req.body.firstName)){
    errors.push({firstNameError:'Please enter your firstname it must be upto 3 characters'})
  }

  if(!validator.isRealName(req.body.lastName)){
    errors.push({lastNameError:'Please enter your lastname it must be upto 3 characters'})
  }

  if(!validator.isRealEmail(req.body.emailAddress)){
    errors.push({emailAddressError:'Please enter your email address eg: example@gmail.com'})
  }

  if(!validator.isRealPassword(req.body.password)){
    errors.push({passwordError:'Please enter your password it must be aleast 4 characters,no more than 8 characters, and must include at least one upper case letter, one lower case letter or one digit'});
  }
  if(req.body.password !== req.body.confirmPassword){
    errors.push({confirmPasswordError:'Password mismatch'});
  }

  if (errors.length > 0){
    res.render('signup/admin', {
      errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    });
  } else {
    const newAdmin = new Admin({
      'firstName': req.body.firstName,
      'lastName': req.body.lastName,
      'emailAddress': req.body.emailAddress,
      'password': req.body.password,
      'pictureDir': ''
    });

    // verify if email already exists
    Admin.findOne({emailAddress: newAdmin.emailAddress})
      .then(admin => {
        if(admin){
          errors = [{emailAddressError: 'email already exists'}];
          res.render('admin/signup', {
            errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
          } )
        }else{
            // hash password
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                if (err) throw err;
                newAdmin.password = hash;
                newAdmin.save()
                  .then(admin => {
                    res.render('signup/success');
                  })
                  .catch(err => {
                    console.log(err);
                  });
              })
              });
        }
      })
      . catch(err => {
        console.log(err);
      });
  }
});

//-- admin index route
router.get('/', ensureAuthenticated, ensureIsAdmin, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('admin/index', {
    pictureDir: pictureDir
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});




//-- Change Password Route
router.get('/changepassword',ensureAuthenticated, ensureIsAdmin, (req, res) => {
    res.render('admin/change_password', {
      user: req.user
    });  
});
//-- Process Change Password
router.put('/', ensureAuthenticated, ensureIsAdmin, (req, res) => {
  userID = req.user.id;
  Admin.findOne({_id: userID})
    .then(user => {
      if(!user){
        req.flash('page_error_msg', 'Unknown admin');
        res.redirect('/');
      } else if(req.body.password === ''){
        req.flash('page_error_msg', 'Password field must not be empty');
        res.redirect(`/admin/changepassword`);
      } else {
        // ensure passwords matched
        if(req.body.password !== req.body.confirmPassword){
          req.flash('page_error_msg', 'Password Mismatch');
          res.redirect(`/admin/changepassword`);
        } else {
          // ensure admin old password provided match the password in db
          bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
              req.flash('page_error_msg', 'Incorrect old password');
              res.redirect(`/admin/changepassword/`);
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (err) throw err;
    
                  user.password = hash;
                  user.save()
                    .then(user => {
                      req.flash('page_success_msg', 'Password changed successfully.');
                      res.redirect('/admin/');
                    });
                });
              });
            }
          });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
});

//-- Edit profile route
router.get('/editprofile', ensureAuthenticated, ensureIsAdmin, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('admin/edit_profile', {
    pictureDir
  });
});

//-- Process Edit profile form
router.put('/editprofile',ensureAuthenticated, ensureIsAdmin, (req, res) => {
  const userID = req.user.id;
  let errors = [];
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  if(!validator.isRealName(req.body.firstName)){
    errors.push({firstNameError:'Please enter your firstname it must be upto 3 characters'})
  }

  if(!validator.isRealName(req.body.lastName)){
    errors.push({lastNameError:'Please enter your lastname it must be upto 3 characters'})
  }

  if(!validator.isRealEmail(req.body.emailAddress)){
    errors.push({emailAddressError:'Please enter your email address eg: example@gmail.com'})
  }

  if (errors.length > 0){
    res.render('admin/edit_profile', {
      user: req.user,
      pictureDir: pictureDir,
      errors
    })
  }else {
    Admin.findOne({_id: userID})
      .then(user => {
        if(!user){
          res.redirect('/');
        }else{
          user.emailAddress = req.body.emailAddress;
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;

          user.save()
            .then(user => {
              res.redirect('/admin/');
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
      })
  }
  
});

//-- process file upload
router.post('/upload', ensureAuthenticated, ensureIsAdmin,(req, res, next) => {

  var upload = new Uploader(path.join(__dirname, '../', 'public/uploads/admins'), '/uploads/admins/',{
    successRedirect: '/admin/',
    failureRedirect: '/admin/editprofile'
  }, Admin);
  
  upload.upload(req, res, next);
});

//-- dashboard route
router.get('/dashboard/', ensureAuthenticated, ensureIsAdmin,(req, res) => {
  res.render('admin/dashboard', {
    dashboardHandler: true
  });
});

//-- compute result details route
router.get('/computeresultdetails/', ensureAuthenticated, ensureIsAdmin,(req, res) => {
  res.render('admin/compute_result_details');
});

router.post('/resultdetails/', ensureAuthenticated, ensureIsAdmin,(req, res) => {
  var academicYear = req.body.year1 + '_' + req.body.year2;
  ResultsLog.find({academicYear: academicYear,
  level: req.body.level,
  session: req.body.session})
  .sort({courseCode: 'asc'})
  .then(resultslogs => {
    if(resultslogs.length > 0){
      res.render('admin/result_sheets',{
        resultSheets: resultslogs,
        totalSheets: resultslogs.length,
        academicYear: academicYear,
        level: req.body.level,
        session: req.body.session
      });
    } else {
      req.flash('page_error_msg', 'no result sheets found');
      res.redirect('/admin/computeresultdetails/')
    }
  })
  .catch(err => {
    req.flash('page_success_msg', 'no result sheets found');
    res.redirect('/admin/computeresultdetails/')
  });
});

//-- Compute result route
router.post('/computeresult/', (req, res) => {
  let creditUnits = req.body.creditUnit;
 ResultsLog.find({
   academicYear: req.body.academicYear,
   level: req.body.level,
   session: req.body.session})
  .sort({courseCode: 'asc'})
  .then(resultslogs => {
    if(resultslogs.length > 0){
      var compositeSheetColumns = [];
      let courseCreditUnits = [];
      
      compositeSheetColumns.push('regNo');
      compositeSheetColumns.push('GPA');


      var resultCollectionNames = [];
      for(var i = 0; i < resultslogs.length; i++){
        compositeSheetColumns.push(resultslogs[i].courseCode);
        resultCollectionNames.push({tableName: resultslogs[i].resultTableName, courseCode: resultslogs[i].courseCode});
        courseCreditUnits.push({courseCode: resultslogs[i].courseCode, creditUnit: Number(creditUnits[i])});
      }

    

      Student.find({level: req.body.level}).sort("desc")
        .then(students => {
          if(students){
            let academicYear = req.body.academicYear;
            let level   = req.body.level;
            let session = req.body.session;

            let collectionName = level + '_' + academicYear + '_' + session;

            let compositeSheetSchema = buildSchemaDoc(compositeSheetColumns);
            let CompositeSheetModel  = buildModel(compositeSheetSchema, collectionName);
            let regNo = [];
            let compute = new Compute(CompositeSheetModel, courseCreditUnits);

            regNo = compute.loadRegNo(students)

            
            var resultSheetModel;
            
            for(let i = 0; i < regNo.length; i++){
              for(let j = 0; j < resultCollectionNames.length;j++){
                resultSheetModel = buildResultSchema(resultCollectionNames[j].tableName);
                let currentCourseCode = resultCollectionNames[j].courseCode;
                
                //--------------------------------Review
                resultSheetModel.findOne({REG_NO: regNo[i]})
                  .then(resultData => {
                    if(resultData){
                      //-- This can be reviewed <---
                      //-- Update this student record
                      compute.updateStudent(resultData.REG_NO, resultData.GRADE, currentCourseCode);
                    } else {
                      console.log("Result Sheet: result not found")
                    } 
                  })
                  .catch(err => {
                    if(err) console.log("Error: ",err);
                  });
              }
              
              compute.computeGPA(regNo[i]);

            }
            CompositeSheetLog.findOne({compositeSheetTableName: collectionName})
              .then(log => {
                if(!log){
                  new CompositeSheetLog({
                    compositeSheetTableName: collectionName,
                    schemaDoc: compositeSheetSchema,
                    academicYear,
                    level,
                    session
                  })
                  .save()
                  .then(log => {
                    req.flash('page_success_msg', 'Result Computed Successfully');
                    res.redirect('/admin/dashboard');
                  });
                } else{
                  req.flash('page_success_msg', 'Result Computed Successfully');
                  res.redirect('/admin/dashboard');
                }
              })
              .catch(err => {
                console.log(err);
              });
            
          }else {
            req.flash('page_error_msg', 'No Student Found');
            res.redirect('/admin/dashboard');
          }
        })
    } else {
      req.flash('page_error_msg', 'No Result Sheet Found');
      res.redirect('/admin/dashboard');
    }
  });
});

module.exports = router;