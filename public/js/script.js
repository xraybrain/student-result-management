var Validator = (function(){
  function isRealName(text){
    pattern = /(\w){3,}/ig;
  
    return pattern.test(text);
  }
  
  function isRealRegNumber(regNo){
    pattern = /(\d){4}\/(nd)|(hnd)\/(cst)\/[0-9]{5}/i;
  
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
  
  return {
    isRealName,
    isRealRegNumber,
    isRealEmail,
    isRealPassword
  }
})();

var UI = (function(){
  var student = document.querySelector('#student');
  var regNoObj = document.querySelector('#regno');
  var regNoErrorObj = document.querySelector('#regNoError');
  var regNoErrorBoxObj = document.querySelector('#regNoErrorBox');
  if(regNoErrorBoxObj !== null) regNoErrorBoxObj.hidden = true;

  var firstNameObj = document.querySelector('#firstname');
  var firstNameErrorObj = document.querySelector('#firstNameError');
  var firstNameErrorBoxObj = document.querySelector('#firstNameErrorBox');
  if(firstNameErrorBoxObj !== null) firstNameErrorBoxObj.hidden = true;

  var lastNameObj = document.querySelector('#lastname');
  var lastNameErrorObj = document.querySelector('#lastNameError');
  var lastNameErrorBoxObj = document.querySelector('#lastNameErrorBox');
  if (lastNameErrorBoxObj !== null) lastNameErrorBoxObj.hidden = true;

  var emailAddressObj = document.querySelector('#email_address');
  var emailErrorObj = document.querySelector('#emailError');
  var emailErrorBoxObj = document.querySelector('#emailErrorBox');
  if (emailErrorBoxObj !== null) emailErrorBoxObj.hidden = true;

  var passwordObj = document.querySelector("#password");
  var confirmPasswordObj = document.querySelector("#confirmPassword");
  var confirmPasswordErrorBoxObj = document.querySelector("#confirmPasswordErrorBox");
  var confirmPasswordError = document.querySelector('#confirmPasswordError');
  if(confirmPasswordErrorBoxObj !== null) confirmPasswordErrorBoxObj.hidden = true;
  
  var academicYearObj = document.querySelector("#academicYear");

  return {
    student: student,
    regNoObj: regNoObj,
    regNoErrorObj: regNoErrorObj,
    regNoErrorBoxObj:regNoErrorBoxObj,
    firstNameObj: firstNameObj,
    firstNameErrorObj: firstNameErrorObj,
    firstNameErrorBoxObj: firstNameErrorBoxObj,
    lastNameObj: lastNameObj,
    lastNameErrorObj: lastNameErrorObj,
    lastNameErrorBoxObj: lastNameErrorBoxObj,
    emailAddressObj: emailAddressObj,
    emailErrorObj: emailErrorObj,
    emailErrorBoxObj: emailErrorBoxObj,
    passwordObj: passwordObj,
    confirmPasswordObj: confirmPasswordObj,
    confirmPasswordErrorBoxObj: confirmPasswordErrorBoxObj,
    confirmPasswordError: confirmPasswordError,
    academicYearObj: academicYearObj
  };
})();




var app = (function(validator, ui){
  var isSubmitOk = true; // this is used to ensure their is no error

  function getAcademicYear(glue) {
    var year  = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var academicYear = '';

    if(month >= 10){
      academicYear = year + glue + (year+1);
    } else {
      academicYear = year-1 + glue + (year);
    }
    if(ui.academicYearObj)
      ui.academicYearObj.innerHTML = '<option value="' +  academicYear + '">' + academicYear + '</option>';
    //return academicYear;
  }
  function addValidateEvent (element, error, errorContainer,validate,event, message){
    element.addEventListener(event, function(e){
      if (!validate(element.value)){
        errorContainer.hidden = false;
        error.innerHTML = message;
        isSubmitOk = false;
      } else {
        errorContainer.hidden = true;
        isSubmitOk = true;
      }
    });
  }

  function addPasswordMatchEvent (password, confirmPassword, error, errorContainer,match,event, message){
    confirmPassword.addEventListener(event, function(e){
      if (!match(password.value, confirmPassword.value)){
        errorContainer.hidden = false;
        error.innerHTML = message;
        isSubmitOk = false;
      } else {
        errorContainer.hidden = true;
        isSubmitOk = true;
      }
    });
  }

  function match(value1, value2){
    if (value1 === value2) return true;

    return false;
  }
  
  if (ui.regNoObj !== null){
    addValidateEvent(ui.regNoObj, ui.regNoErrorObj, ui.regNoErrorBoxObj, validator.isRealRegNumber, 'keyup', "Please enter your matriculation number eg: 2017/ND/CST/18000");
  }
  if (ui.firstNameObj !== null){
    addValidateEvent(ui.firstNameObj, ui.firstNameErrorObj, ui.firstNameErrorBoxObj, validator.isRealName, 'keyup', 'Please enter your firstname it must be upto 3 characters');
  }
  if (ui.lastNameObj !== null){
    addValidateEvent(ui.lastNameObj, ui.lastNameErrorObj, ui.lastNameErrorBoxObj, validator.isRealName, 'keyup', 'Please enter your lastname it must be upto 3 characters');
  }
  if (ui.emailAddressObj !== null){
    addValidateEvent(ui.emailAddressObj, ui.emailErrorObj, ui.emailErrorBoxObj, validator.isRealEmail, 'keyup', "Please enter your email address eg: example@gmail.com");
  }

  if (ui.confirmPasswordErrorBoxObj !== null) {
    addPasswordMatchEvent(ui.passwordObj,ui.confirmPasswordObj, ui.confirmPasswordError, ui.confirmPasswordErrorBoxObj, match, 'keyup', "Password mismatch");
    addPasswordMatchEvent(ui.confirmPasswordObj,ui.passwordObj, ui.confirmPasswordError, ui.confirmPasswordErrorBoxObj, match, 'keyup', "Password mismatch");
  }
  return {
    isSubmitOk: isSubmitOk,
    getAcademicYear: getAcademicYear
  };
})(Validator, UI);
app.getAcademicYear('_');