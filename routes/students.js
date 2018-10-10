const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const validator  = require('../utils/validate');
const path     = require('path');

//-- the ModelBuilder
const {buildResultSchema, buildSchemaDoc, buildModel} = require('../utils/ModelBuilder');

const {ensureAuthenticated} = require('../utils/auth');


//-- the file uploader class
const Uploader = require('../utils/Uploader');

//-- Load the compositesheetlog model
require('../models/CompositeSheetLog');
const CompositeSheetLog = mongoose.model('compositesheetlog');

// require student model
require('../models/Student');
const Student = mongoose.model('students');


//-- index route
router.get('/', ensureAuthenticated, (req, res) => {
  let pictureDir = req.user.pictureDir;
  if(!pictureDir){
    pictureDir = "/img/user.png"
  }
  res.render('student/index',
  {
    pictureDir: pictureDir,
    student: true
  }
  );
})

//-- Signup Student route
router.get('/signup', (req, res) => {
  res.render('student/signup');
});

//-- process student signup form
router.post('/signup', (req, res)=>{
  let errors = []; 
  
  if(!validator.isRealName(req.body.firstName)){
    errors.push({firstNameError:'Please enter your firstname it must be upto 3 characters'})
  }

  if(!validator.isRealName(req.body.lastName)){
    errors.push({lastNameError:'Please enter your lastname it must be upto 3 characters'})
  }

  if(!validator.isRealRegNumber(req.body.regNo)){
    errors.push({regNoError:'Please enter your matriculation number eg: 2017/ND/CST/18000'})
  }

  if(!validator.isRealEmail(req.body.emailAddress)){
    errors.push({emailAddressError:'Please enter your email address eg: example@gmail.com'})
  }

  if(req.body.password != req.body.confirmPassword) {
    errors.push({confirmPasswordError: 'Password Mismatch'});
  }
  
  if(errors.length > 0){
    res.render('student/signup', {
      errors,
      regNo: req.body.regNo,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      level: req.body.level,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    });
  } else {
    const newStudent = new Student({
      regNo: req.body.regNo,
      emailAddress: req.body.emailAddress,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      level: req.body.level,
      password: req.body.password,
      pictureDir: ''
    });
    
    //-- Ensures that no two students has the same email
    Student.findOne({emailAddress: newStudent.emailAddress})
      .then(student => {
        if(student){
          errors.push({emailAddressError: 'email already exists'});
          res.render('student/signup', {
            errors,
            regNo: req.body.regNo,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            level: req.body.level,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
          });
        } else {
          //-- Ensures that no two students has same reg no
          Student.findOne({regNo: newStudent.regNo})
             .then(student => {
               if(student){
                 errors.push({regNoError: 'matriculation number already exists'});
                 res.render('student/signup', {
                  errors,
                  regNo: req.body.regNo,
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  emailAddress: req.body.emailAddress,
                  level: req.body.level,
                  password: req.body.password,
                  confirmPassword: req.body.confirmPassword
                 })
               } else {
                 bcrypt.genSalt(10, (err, salt) => {
                   bcrypt.hash(newStudent.password, salt, (err, hash) => {
                    newStudent.password = hash;

                    newStudent
                    .save()
                    .then(student => {
                      res.redirect('/student/login')
                    });
                   });
                 });
                
               }
             })
        }
        
      })

    
  }
});


//-- Login Route
router.get('/login', (req, res) => {
  res.render('student/login');
});
//-- Process Login
router.post('/login', (req, res, next) => {
  //-- Load the passport config
  require('../config/passport')(passport, Student);
  
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/student/login',
    failureFlash: true
  })(req, res, next);
});

//-- Edit profile route
router.get('/editprofile', ensureAuthenticated, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('student/edit_profile', {
    pictureDir,
    student: true
  });
});

//-- process student edit profile form
router.put('/editprofile', (req, res)=>{
  let errors = []; 
  const userID = req.user._id;
  
  if(!validator.isRealName(req.body.firstName)){
    errors.push({firstNameError:'Please enter your firstname it must be upto 3 characters'})
  }

  if(!validator.isRealName(req.body.lastName)){
    errors.push({lastNameError:'Please enter your lastname it must be upto 3 characters'})
  }

  if(!validator.isRealRegNumber(req.body.regNo)){
    errors.push({regNoError:'Please enter your matriculation number eg: 2017/ND/CST/18000'})
  }

  if(!validator.isRealEmail(req.body.emailAddress)){
    errors.push({emailAddressError:'Please enter your email address eg: example@gmail.com'})
  }
  
  if(errors.length > 0){
    res.render('student/edit_profile', {
      errors,
      regNo: req.body.regNo,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      level: req.body.level
    });
  } else {
    Student.findOne({_id: userID})
      .then(student => {
        if(!student){
          res.redirect('/editprofile')
        } else {
          student.regNo        = req.body.regNo;
          student.emailAddress = req.body.emailAddress;
          student.firstName    = req.body.firstName;
          student.lastName     = req.body.lastName;
          student.level        = req.body.level;

          student.save()
           .then(student => {
             res.redirect('/student/');
           });
        }
      });

    
  }
});

//-- process file upload
router.post('/upload', ensureAuthenticated,(req, res, next) => {

  var upload = new Uploader(path.join(__dirname, '../', 'public/uploads/students'), '/uploads/students/',{
    successRedirect: '/student/',
    failureRedirect: '/student/editprofile'
  }, Student);
  
  upload.upload(req, res, next);
});

//-- change password route
router.get('/changepassword/', ensureAuthenticated, (req, res) => {
  var pictureDir = req.user.pictureDir;
  if (!pictureDir){
    pictureDir = '/img/user.png';
  }

  res.render('student/change_password', {
    pictureDir,
    student: true
  });
});

//-- Process Change Password
router.put('/', ensureAuthenticated, (req, res) => {
  userID = req.user.id;
  Student.findOne({_id: userID})
    .then(user => {
      if(!user){
        req.flash('page_error_msg', 'Unknown Student');
        res.redirect('/');
      } else if(req.body.password === ''){
        req.flash('page_error_msg', 'Password field must not be empty');
        res.redirect(`/student/changepassword`);
      } else {
        // ensure passwords matched
        if(req.body.password !== req.body.confirmPassword){
          req.flash('page_error_msg', 'Password Mismatch');
          res.redirect(`/students/changepassword`);
        } else {
          // ensure student old password provided match the password in db
          bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
              req.flash('page_error_msg', 'Incorrect old password');
              res.redirect(`/student/changepassword/`);
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (err) throw err;
    
                  user.password = hash;
                  user.save()
                    .then(user => {
                      req.flash('page_success_msg', 'Password changed successfully.');
                      res.redirect('/student/');
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


//-- Result Checker
router.post('/resultchecker', ensureAuthenticated, (req, res) => {
  let academicYear = `${req.body.year1}_${req.body.year2}`
  let collectionName = `${req.body.level}_${academicYear}_${req.body.session}`;
  let regNo = req.body.regNo;

  CompositeSheetLog.findOne({compositeSheetTableName: collectionName})
    .then(log => {
      if(log){
        const CompositeSheetModel = buildModel(log.schemaDoc, log.compositeSheetTableName);

        CompositeSheetModel.findOne({regNo: regNo})
          .then(result => {
            if(result){
              
              let resultData = [];
              let columnHeading = Object.getOwnPropertyNames(result._doc);
              for(const heading of columnHeading){
                switch(heading){
                  case '__v':
                  break;
                  case '_id':
                  break;
                  case 'regNo':
                  break;
                  default:
                   resultData.push({"courseCode": heading, "grade": result[heading]});
                }
              }
              res.render('student/checkedresult', {
                resultData
              });
              
            }
          })
      }else{
        req.flash('page_error_msg', 'Result not available');
        res.redirect('/');
      }
    })
});

//-- Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;