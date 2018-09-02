const express  = require('express');
const mongoose = require('mongoose');
const exphbs   = require('express-handlebars');
const formidable   = require('formidable');
const bodyParser   = require('body-parser');
const flash    = require('connect-flash');
const session  = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const excel  = require('./utils/excel-reader');



// console.log(validator.isRealPassword('Nonsosky1'));

// var book = excel.read('./public/excel/result.xlsx');
// var workBook = excel.to_json(book).Sheet1;

// for(var i = 0; i < workBook.length; i++){
//   console.log(workBook[i].Surname, workBook[i].firstname);
// }


//**Connect to Mongoose 
mongoose.connect('mongodb://127.0.0.1:27017/resultManagement', {
  useNewUrlParser: true
})
  .then(()=> console.log('MongoDB Connected...'))
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
  res.locals.admin_success_msg = req.flash('admin_success_msg');
  res.locals.admin_error_msg = req.flash('admin_error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
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
  res.render('index', {
    pageTitle: 'Student Result Management'
  });
});

app.get('/signup/success', (req, res) => {
  res.render('signup/success');
});

// Server Port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});