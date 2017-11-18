

var express                 = require("express"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    flash                   = require("connect-flash"),
    methodOverride          = require("method-override"),
    expressSanitizer        = require("express-sanitizer"),
    passport                = require("passport"),
    cookieParser            = require('cookie-parser'),
    expressSession          = require("express-session"),
    morgan                  = require('morgan'),
    seedDB                  = require("./seeds");

// ROUTES
var commentRoutes           = require("./routes/comments"),
    campgroundRoutes        = require("./routes/campgrounds"), 
    indexRoutes             = require("./routes/index"),
    userRoutes              = require("./routes/user"),
    ratingRoutes            = require("./routes/ratings");
    
// Setup Express
var app                     = express();

// Setup DB
var configDB = require('./config/database.js');
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

// Seed the database
//seedDB();

// Log to console
//app.use(morgan('dev')); // log every request to the console

// Setup body parser: Allows us to use req.body, which gives us all the data from the request body
// Setup sanitizer -- must be after body parser
// use with posts
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
    
// Setup Method Override 
app.use(methodOverride("_method"));

// Configure app: use ejs by default
app.set("view engine", "ejs");

// Use Public to look for css
app.use(express.static(__dirname + "/public")); //dirname is directory this script is running

// Express Session - Run express session with these parameters
app.use(expressSession({
    secret: "I love fairooz", // Used to encode and decode session
    resave: false,
    saveUninitialized: false
}));
// Setting passport up to work in our application
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
// Tell app to use flash
app.use(flash());


// Setting up our own middleware. app.use calls this function on every route
// passport is what creates req.user, it puts id in it
app.use(function(req,res, next) {
    res.locals.currentUser = req.user; // whatever we put in res.locals is what is available in our template. this is empty if no one is logged in
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next(); // move on to next code
})


// Tells app to use the three routes
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/ratings", ratingRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/users", userRoutes);

//mongoose.set('debug',true);

/* --------------------------- */
/* ---------- LISTEN --------- */
/* --------------------------- */

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp started");
});
