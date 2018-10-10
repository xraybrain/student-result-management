const mongoose = require('mongoose');
//-- Load the Lecturer Model
require('../models/Lecturer');
const Lecturer = mongoose.model('lecturers');

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error_msg', 'Not Authorized');
  res.redirect('/');
}

function ensureIsAdmin(req, res, next){
  if(req.user.userType === 'admin'){
    return next();
  }

  res.redirect('/');
}

function ensureIsActivated(req, res, next){
  const userType = req.user.userType;

  switch(userType){
    case 'lecturer':
      Lecturer.findOne({_id: req.user._id})
        .then(user => {
          if(user){
            if(user.active === 1){
              return next();
            } else{
              req.flash('page_error_msg', 'Sorry Your Account is not yet activated, contact the admin.');
              res.redirect('/');
            }
          } else {
            req.flash('page_error_msg', 'Sorry No active user found.');
            res.redirect('/');
          }
          
        })
        .catch(err => {
          console.log(err);
          res.redirect('/');
        });
  }
}

module.exports = {ensureAuthenticated, ensureIsAdmin, ensureIsActivated};