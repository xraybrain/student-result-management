const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const passport = require('passport');

const validator = require('../utils/validate');

// require lecturer model
require('../models/Lecturer');
const Lecturer = mongoose.model('lecturers');


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