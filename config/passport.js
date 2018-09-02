const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

//-- Load admin schema
require('../models/Admin');
const Admin = mongoose.model('admin');
// require lecturer model
require('../models/Lecturer');
const Lecturer = mongoose.model('lecturers');
// require student model
require('../models/Student');
const Student = mongoose.model('students');


module.exports = function (passport, User) {
  
  passport.use(new LocalStrategy({usernameField: 'emailAddress'}, (emailAddress, password, done) =>{
    //-- Match User
    User.findOne({emailAddress: emailAddress})
      .then(user => {
        
        if (!user) {
          return done(null, false, {message:'No User with such email found'});
        }

        //-- Match User password
        bcrypt.compare(password ,user.password, (err, isMatch) => {
          if(err) throw err;

          if(isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {message: 'Password Incorrect'});
          }
        });
        
      })
      .catch(err => {
        console.log(err);
      });
  }));

  passport.serializeUser(function(user, done){
    
    done(null, {_id:user.id, type: user.userType});
  });

  passport.deserializeUser(function(key, done){
    User = {};

    if(key.type === 'admin') User = Admin;
    if(key.type === 'lecturer') User = Lecturer;
    if(key.type === 'student') User = Student;

    User.findById(key._id, function(err, user){
      done(err, user);
    });
  });
}