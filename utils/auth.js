function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error_msg', 'Not Authorized');
  res.redirect('/');
}

function ensureIsAdmin(req, res, next){
  if(req.user.userType === 'admin'){
    return next();
  }

  res.redirect('/');
}

module.exports = {ensureAuthenticated, ensureIsAdmin};