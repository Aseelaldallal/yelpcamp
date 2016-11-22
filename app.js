

/* --------------------------- */
/* ---------- SETUP ---------- */
/* --------------------------- */

var express                 = require("express"),
    request                 = require("request"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    flash                   = require("connect-flash"),
    methodOverride          = require("method-override"),
    expressSanitizer        = require("express-sanitizer"),
    seedDB                  = require("./seeds"),
    passport                = require("passport"),
    localStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    expressSession          = require("express-session"),
    Campground              = require("./models/campground"),
    Comment                 = require("./models/comment"),
    User                    = require("./models/user");
    
    
// ROUTES
var commentRoutes           = require("./routes/comments"),
    campgroundRoutes        = require("./routes/campgrounds"), 
    indexRoutes             = require("./routes/index");

// Setup Express
var app = express();

// Setup Method Override 
app.use(methodOverride("_method"));


// Setup body parser: Allows us to use req.body, which gives us all the data from the request body
// Setup sanitizer -- must be after body parser
// use with posts
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());

// Configure app: use ejs by default
app.set("view engine", "ejs");

// Use Public to look for css
app.use(express.static(__dirname + "/public")); //dirname is directory this script is running

// Connect to database 
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/yelp_camp");

// Seed the database
//seedDB();

// Express Session - Run express session with these parameters
app.use(expressSession({
    secret: "I love fairooz", // Used to encode and decode session
    resave: false,
    saveUninitialized: false
}));

// Setting passport up to work in our application
app.use(passport.initialize());
app.use(passport.session());

// Responsible for reading session, taking data from session thats encoded and unencoding it
// and then encoding it and putting it back in the session
passport.use(new localStrategy(User.authenticate())); // Creating a new local strategy using the user.authenticate method that is coming from passportLocalMongoose -- we don't need to write authenticate method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
app.use("/campgrounds", campgroundRoutes);

/* --------------------------- */
/* ---------- LISTEN --------- */
/* --------------------------- */

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp started");
});
