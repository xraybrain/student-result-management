function isRealName(text){
  pattern = /(\w){3,}/ig;

  return pattern.test(text);
}

function isRealRegNumber(regNo){
  pattern = /^\d{4}\/(nd)|(hnd)\/[a-z]{3,4}\/\d{5,}$/ig;

  return pattern.test(regNo);
}

function isRealEmail(email){
  pattern = /^[\w\.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/ig;

  return pattern.test(email);
}

function isRealPassword(password){
  pattern = /^(\w){4,6}$/;

  return pattern.test(password);
}

module.exports = {
  isRealName,
  isRealRegNumber,
  isRealEmail,
  isRealPassword
}