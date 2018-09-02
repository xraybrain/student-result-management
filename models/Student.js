const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const StudentSchema = new Schema({

  regNo: {
    type:     String,
    required: true
  }
  ,
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
  level: {
    type:     String,
    required: true
  }
  ,
  password: {
    type: String,
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
    default: "student"
  }
});

mongoose.model('students', StudentSchema);