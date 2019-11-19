const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
const { accessibleRecordsPlugin } = require('@casl/mongoose')
const errorHandler = require('./error-handler')
const passport = require('passport')
const { configurePassport } = require('./models/auth/jwt')
const createAbilities = require('./models/auth/abilities')
const Apiroutes = ['customers', 'options', 'privilidgetypes','allprivilidges','emails','membership',
'activities','unitresources','shifts','timeschedual','attendance','media','notifications','reports',
'cronjob','transactions','clubbilling' , 'workouts','log']

const ApiAdminroutes = ['admin','accountprivilidge','privilidgetypes','accounts','membership','acountmembership','billing']
const Apiusesroutes=['auth','membership','attendance']
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/admin');
var cors = require('cors');


module.exports = function createApp() {

  var app = express();

  // use it before all route definitions
  // app.use(cors({origin: 'http://localhost:4200'}));
  app.use(cors({origin: '*'}));

  const secret = 'secret.casl.authorization'
  app.set('jwt.secret', secret)
  app.set('jwt.issuer', 'CASL.Express')
  app.set('jwt.audience', 'casl.com')
  configurePassport(passport, { secretOrKey: secret ,'issuer':'CASL.Express','audience':'casl.com'})
  app.use(passport.initialize())
  app.use(passport.authenticate('jwt', { session: false }), createAbilities)

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(expressLayouts);
  app.use(session({secret:'tueut^%$6kngniob%#$',resave:false,saveUninitialized:true}));

  app.use('/', indexRouter);
  app.use('/admin', usersRouter);


  mongoose.plugin(accessibleRecordsPlugin)
  app.use(bodyParser.json())

  Apiroutes.forEach(routeName => {
    const route = require(`./routes/api/v1/${routeName}`)
    app.use(`/api/v1/${routeName}`, route);
  })

  ApiAdminroutes.forEach(routeName => {
    const route = require(`./routes/api/v1/admin/${routeName}`)
    app.use(`/api/admin/v1/${routeName}`, route);
  })

  Apiusesroutes.forEach(routeName => {
    const route = require(`./routes/api/v1/users/${routeName}`)
    //console.log(route)
    app.use(`/api/member/v1/${routeName}`,route);
  })
  // // catch 404 and forward to error handler
  // app.use(function(req, res, next) {
  //   next(createError(404));
  // });
  // // error handler
  // app.use(function(err, req, res, next) {
  //
  //   // set locals, only providing error in development
  //   res.locals.message = err.message;
  //   res.locals.error = req.app.get('env') === 'development' ? err : {};
  //
  //   // render the error page
  //   res.status(err.status || 500);
  //   res.render('error',{layout:false});
  // });
  app.use(errorHandler)
  mongoose.Promise = global.Promise
 //return mongoose.connect('mongodb://localhost:27017/maindb?authSource=admin',{ useNewUrlParser: true })
 //return mongoose.connect('mongodb://hassan:phpdev2016@mongodb-2399-0.cloudclusters.net:10011/maindb?authSource=admin',{ useNewUrlParser: true })
 //return mongoose.connect('mongodb+srv://hassan:phpdev2016@cluster0-vfijl.mongodb.net/maindb?retryWrites=true&w=majority',{ useNewUrlParser: true })
return mongoose.connect('mongodb+srv://ramyezz:GzIAaLxL0LCmP5ca@cluster0-2f9lp.mongodb.net/gymindb?retryWrites=true&w=majority',{ useNewUrlParser: true })
 .then(() => app)
}

// mongoose.connection.on('error', (err)=>{
//   console.log('>> Failed to connect to MongoDB, retrying...');

//   setTimeout( () => {
//     mongoose.connect('mongodb://localhost:27017/maindb?authSource=admin',{ useNewUrlParser: true })
//   }, 5000);
// });
