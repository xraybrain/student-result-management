const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const path     = require('path');


const validator = require('../utils/validate');

const {ensureAuthenticated, ensureIsAdmin} = require('../utils/auth');

const {buildResultSchema} = require('../utils/ModelBuilder');

const excel      = require('../utils/excel-reader');

// require lecturer model
require('../models/Lecturer');
const Lecturer = mongoose.model('lecturers');

//-- 
var Uploader = require('../utils/Uploader');

//-- Index route
router.get('/', ensureAuthenticated, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('lecturer/index', {
    pictureDir: pictureDir,
    Lecturer: req.user.userType
  });
});

//-- Change Password Route
router.get('/changepassword',ensureAuthenticated, (req, res) => {
  res.render('lecturer/change_password', {
    user: req.user
  });  
});

//-- Edit Profile Route
router.get('/editprofile', ensureAuthenticated, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('lecturer/edit_profile', {
    pictureDir
  });
});


//-- Process Change Password
router.put('/', ensureAuthenticated, (req, res) => {
  userID = req.user.id;
  Lecturer.findOne({_id: userID})
    .then(user => {
      if(!user){
        req.flash('page_error_msg', 'Unknown Lecturer');
        res.redirect('/');
      } else if(req.body.password === ''){
        req.flash('page_error_msg', 'Password field must not be empty');
        res.redirect(`/lecturer/changepassword`);
      } else {
        // ensure passwords matched
        if(req.body.password !== req.body.confirmPassword){
          req.flash('page_error_msg', 'Password Mismatch');
          res.redirect(`/lecturer/changepassword`);
        } else {
          // ensure admin old password provided match the password in db
          bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
              req.flash('page_error_msg', 'Incorrect old password');
              res.redirect(`/lecturer/changepassword/`);
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (err) throw err;
    
                  user.password = hash;
                  user.save()
                    .then(user => {
                      req.flash('page_success_msg', 'Password changed successfully.');
                      res.redirect('/lecturer/');
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

//-- Process Edit Profile
router.put('/editprofile', ensureAuthenticated, (req, res) => {
  const userID = req.user.id;
  let errors = [];
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  if(!validator.isRealName(req.body.firstName)){
    errors.push({firstNameError:'Please enter your firstname it must be upto 3 characters'});
  }

  if(!validator.isRealName(req.body.lastName)){
    errors.push({lastNameError:'Please enter your lastname it must be upto 3 characters'})
  }

  if(!validator.isRealEmail(req.body.emailAddress)){
    errors.push({emailAddressError:'Please enter your email address eg: example@gmail.com'})
  }

  if (errors.length > 0){
    res.render('lecturer/edit_profile', {
      pictureDir: pictureDir,
      errors
    })
  }else {
    Lecturer.findOne({_id: userID})
      .then(user => {
        if(!user){
          res.redirect('/');
        }else{
          user.emailAddress = req.body.emailAddress;
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;

          user.save()
            .then(user => {
              res.redirect('/lecturer/');
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
router.post('/upload', (req, res, next) => {

  var upload = new Uploader(path.join(__dirname, '../', 'public/uploads/lecturers'), '/uploads/lecturers/',{
    successRedirect: '/lecturer/',
    failureRedirect: '/lecturer/editprofile'
  }, Lecturer);
  upload.upload(req, res, next);

});

//-- Upload result route
router.get('/uploadresult', ensureAuthenticated, (req, res) => {
  res.render('lecturer/upload_result');
});

//-- Preview Result Upload
router.post('/uploadresult', (req, res, next) => {
  var upload = new Uploader(path.join(__dirname, '../', 'private/results'), null,{
    successRedirect: '/lecturer/',
    failureRedirect: '/lecturer/uploadresult',
    isResult:true
  }, Lecturer);
  upload.upload(req, res, next);
});
//-- Process uploaded result
router.post('/submitresult', (req, res) => {
  const ResultSchema = buildResultSchema(req.body.resultName);
  var resultData = [];
  
  var resultSheet = excel.read(req.body.fileName);
  resultData = excel.to_json(resultSheet).Sheet1;

  for(var i = 0; i < resultData.length; i++) {
    new ResultSchema(resultData[i])
     .save()
     .then(result => {});
  }

  res.redirect('/');
});
// Signup Lecturers route
router.get('/signup', (req, res) => {
  res.render('lecturer/signup');
});

// process lecturer signup form
router.post('/signup', (req, res)=>{
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
    errors.push({passwordError:'Please enter your password it must be aleast 4 characters'})
  }

  if(req.body.password !== req.body.confirmPassword) {
    errors.push({confirmPasswordError: 'Password Mismatch'})
  }
  
  if(errors.length > 0){
    res.render('lecturer/signup', {
      errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    });
  } else {
    const newLecturer = new Lecturer({
      emailAddress: req.body.emailAddress,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      pictureDir: ''
    });
    
    //-- Ensures that no two lecturers has the same email
    Lecturer.findOne({emailAddress: newLecturer.emailAddress})
      .then(lecturer => {
        if(lecturer) {
          errors.push({emailAddressError: 'Email already exists'});
          res.render('lecturer/signup',{
            errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
          })
        } else {
          //-- encrypt password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newLecturer.password, salt, (err, hash) => {
              if(err) throw err;

              newLecturer.password = hash;
              //-- insert the new lecturer
              newLecturer
                .save()
                .then(lecturer => {
                  res.redirect('/signup/success')
                });
            });
          });
        }
      })
    
  }
});

//-- Login Route
router.get('/login', (req, res) => {
  res.render('lecturer/login');
});
//-- Process Login
router.post('/login', (req, res, next) => {
  //-- Load the passport config
  const strategy = require('../config/passport')(passport, Lecturer);

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/lecturer/login',
    failureFlash: true
  }, strategy)(req, res, next);
});

//-- Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;