const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CompositeSheetLogSchema = new Schema({
  compositeSheetTableName: {
    type: String,
    required: true
  }
  ,
  schemaDoc: {
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

mongoose.model('compositesheetlog', CompositeSheetLogSchema);