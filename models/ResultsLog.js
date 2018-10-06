const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const ResultsLogSchema = new Schema({
  resultTableName: {
    type: String,
    required: true
  }
  ,
  courseCode: {
    type: String,
    required: true
  }
  ,
  academicYear: {
    type: String,
    required: true
  }
  ,
  level: {
    type: String,
    required: true
  }
  ,
  session: {
    type: Number,
    required: true
  }
  ,
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('resultslog', ResultsLogSchema);