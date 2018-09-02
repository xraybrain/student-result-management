const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const AdminSchema = new Schema({

  emailAddress: {
    type:     String,
    required: true
  }
  ,
  firstName: {
    type:     String,
    required: true
  }
  ,
  lastName: {
    type:     String,
    required: true
  }
  ,
  password: {
    type:     String,
    required: true
  }
  ,
  pictureDir: {
    type:     String,
    required: false
  }
  ,
  userType: {
    type: String,
    default: "admin"
  }

});

mongoose.model('admin', AdminSchema);