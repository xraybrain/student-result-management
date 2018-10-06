const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

//-- Admin model
require('../models/Admin');
const Admin = mongoose.model('admin');

function adminConfig(){
  Admin.find({})
    .then(admin => {
      if(admin.length === 0){
        let newAdmin = new Admin({
          firstName: "jude",
          lastName: "johnbosco",
          password: "{xray8080}",
          emailAddress: "xraybrain@gmail.com",
          pictureDir: ''
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if(err) throw err;

            newAdmin.password = hash;
            newAdmin.save();
          })
        })

      }
    })
}

module.exports = {adminConfig};