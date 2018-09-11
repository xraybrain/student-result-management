function getFullName(user){
  var fullName = '';

  if(user){
    fullName = user.firstName + ' ' + user.lastName;
  }
  return fullName;
}

module.exports = {getFullName};