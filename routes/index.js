
/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */

var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");



/* ------------------------------------- */
/* -----------------ROUTES-------------- */
/* ------------------------------------- */


router.get("/", function(req,res) {
   res.render("landing");
});



// REGISTER GET

router.get("/register", function(req, res) {
    res.render("register");
});


// REGISTER POST

router.post("/register", function(req,res) {
    // Add the username and password to database
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message)
            res.redirect("/register");
        } else {
            passport.authenticate('local')(req,res, function() {
                req.flash("success", "Welcome to YelpCamp " + user.username);
                res.redirect("/campgrounds");
            });
        }
    });
}); 



// LOGIN GET

router.get("/login", function(req,res) {
    res.render("login");
});



// LOGIN POST

router.post("/login", passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req,res) {
        //Nothing here
    }
);

// LOGOUT ROUTE

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
}); 



/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */



module.exports = router; 