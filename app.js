const express  = require('express');
const mongoose = require('mongoose');
const exphbs   = require('express-handlebars');
const bodyParser   = require('body-parser');
const flash    = require('connect-flash');
const session  = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const {getFullName} = require('./helpers/usersHelper');

//-- db config
const {mongoURI} = require('./config/database'); 

const {adminConfig} = require('./config/app-config');

//**Connect to Mongoose 
mongoose.connect(mongoURI, {
  useNewUrlParser: true
})
  .then(()=> {
    console.log('MongoDB Connected...');
    adminConfig();
  })
  .catch((err)=>console.log(err));
//--Mongoose connection ends here


//**Load routes */
const students = require('./routes/students');
const lecturers = require('./routes/lecturers');
const admins = require('./routes/admins');
//--routes load ends here


// initialize app entry point
const app = express();

// Express session middle ware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//-- Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//-- Flash middleware
app.use(flash());

//-- Method Override MiddleWare
app.use(methodOverride('_method'));

//-- Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.page_success_msg = req.flash('page_success_msg');
  res.locals.page_error_msg = req.flash('page_error_msg');
  res.locals.upload_error = req.flash('upload_error');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.fullName = getFullName(req.user);
  next();
});


// handelbars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());



// Set the public folder
app.use(express.static('public'));

//** use routes
app.use('/student', students);
app.use('/lecturer', lecturers);
app.use('/admin', admins);
//--

// Index route
app.get('/', (req, res) => {
  let student;
  let lecturer;

  if(req.user){
    student  = req.user.userType === "student" ? true : false;
    lecturer = req.user.userType === "lecturer" ? true : false;
  }
  

  res.render('index', {
    pageTitle: 'Student Result Management',
    student,
    lecturer
  });
});

app.get('/signup/success', (req, res) => {
  res.render('signup/success');
});

//-- This redirects users visiting unmatched routes to the homepage
app.all('*', (req, res) => {
  res.redirect('/');
});


// Server Port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});