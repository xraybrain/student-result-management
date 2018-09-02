const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');


const {ensureAuthenticated, ensureIsAdmin} = require('../utils/auth');

const validator = require('../utils/validate');

//-- Load admin schema
require('../models/Admin');
const Admin = mongoose.model('admin');


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
        req.flash('admin_error_msg', 'Unknown admin');
        res.redirect('/');
      } else if(req.body.password === ''){
        req.flash('admin_error_msg', 'Password field must not be empty');
        res.redirect(`/admin/changepassword`);
      } else {
        // ensure passwords matched
        if(req.body.password !== req.body.confirmPassword){
          req.flash('admin_error_msg', 'Password Mismatch');
          res.redirect(`/admin/changepassword`);
        } else {
          // ensure admin old password provided match the password in db
          bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
              req.flash('admin_error_msg', 'Incorrect old password');
              res.redirect(`/admin/changepassword/`);
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (err) throw err;
    
                  user.password = hash;
                  user.save()
                    .then(user => {
                      req.flash('admin_success_msg', 'Password changed successfully.');
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
    user: req.user,
    pictureDir
  });
});

//-- Process Edit profile form
router.put('/editprofile', (req, res) => {
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
router.post('/upload', (req, res) => {
  const userID = req.user._id;
  var pictureUploadDir = path.join(__dirname, '../public/uploads/admins/');
  const allowedFileTypes = ['.jpg','.jpeg','.png'];
  var relativePath = '/uploads/admins/';
  
  var targetFilePath = '';
  var fileExtension = '';
  var targetFile = '';

  const form = new formidable.IncomingForm();
  
  form.parse(req, (err, fields, files) => {
    targetFilePath = files.picture.path;
    targetFile = files.picture.name;
    fileExtension =  path.extname(targetFile);

    if(!targetFile){
      req.flash('admin_error_msg', 'a file must be selected');
      res.redirect(`/admin/editprofile/${userID}`);
    } else {
      var isAllowed = allowedFileTypes.filter(ext => {
        if(ext === fileExtension) return fileExtension;
      });

      if(isAllowed.length > 0){
        pictureUploadDir += targetFile;
        relativePath += targetFile;

        // moves the file to the server
        fs.rename(targetFilePath, pictureUploadDir, (err => {
          console.log(err);
        }));

        // retrieve the admin data
        Admin.findOne({_id: userID})
          .then(user => {
            if(user){
              // remove the user image if any
              if (user.pictureDir !== ''){
                var filePath = path.join(__dirname,'../public', user.pictureDir);
                console.log(filePath);
                fs.unlink(filePath, (err) => {
                  console.log(err); // if file not found this error is displayed
                });
              }
              
              user.pictureDir = relativePath;
              user.save()
              .then(user=> {
                res.redirect(`/admin/`);
              })
              .catch(err => {
                console.log(err);
              })
            } else{
              req.flash('admin_error_msg', 'Sorry, file was not uploaded');
              res.redirect(`/admin/editprofile/${userID}`);
            }
          })
          .catch(err => {
            console.log(err);
          })
      } else {
        req.flash('admin_error_msg', 'Sorry, file type is not allowed');
        res.redirect(`/admin/editprofile/${userID}`);
      }
    }
  })
});

router.get('/dashboard/', (req, res) => {
  res.render('admin/dashboard');
});
module.exports = router;