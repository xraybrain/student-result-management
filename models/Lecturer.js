const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LecturerSchema = new Schema({

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
    default: "lecturer"
  }
});

mongoose.model('lecturers', LecturerSchema);