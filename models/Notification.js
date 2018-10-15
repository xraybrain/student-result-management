const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const NotificationSchema = new Schema({
  message: {
    type: String,
    required: true
  }
  ,
  seen: {
    type: Number,
    default: 0
  }
  ,
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('notifications', NotificationSchema);