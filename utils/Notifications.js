const mongoose = require('mongoose');

require('../models/Notification');
const Notification = mongoose.model('notifications');

class Notifications {
  constructor(){}

  getTotal(){
    return Notification.find({seen: 0})
            .then(notification => {
              return notification.length;
            });
  }

  delete(id){
   
      return Notification.remove({_id: id})
        .then(err => {
          if(err.ok !== 1){
            return false;
          }
          return true;
        });
  }

  unSeen(){
    Notification.find({})
    .then(notifications => {
      for(const notification of notifications){
        notification.seen = 1;
        notification.save();
      }
    })
    .catch(err => {
      console.log(err);
    });

    return;
  }

  getAll(){
    return Notification.find({})
    .sort({date: 'desc'})
    .then(notifications => {
      return notifications;
    });
  }
}

module.exports = Notifications;