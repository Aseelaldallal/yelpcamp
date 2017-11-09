/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */

var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware      = require("../middleware");
var seedData = require('../seedData/places.json');

/* ------------------------------------- */
/* -----------------ROUTES-------------- */
/* ------------------------------------- */


router.get("/", function(req,res) {
   res.render("landing");
});

// LOGIN GET

router.get("/login", function(req,res) {
    res.render("login");
});

// LOGIN POST

router.post("/login", middleware.sanitizeUserInput, middleware.validateLoginForm, passport.authenticate("local-login", 
    {   failureRedirect: "/login",
        failureFlash: true,
    }), function(req, res){
        req.flash("success","Welcome " + req.user.local.username + "!");
        res.redirect(`/users/${req.user._id}`);
    }
);


// LOGOUT ROUTE

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
}); 


// Dev Notes
router.get("/devnotes", function(req,res) {
    res.render("devNotes"); 
});

// Dev Notes
router.get("/seedData", function(req,res) {
    res.send(seedData); 
});



/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */



module.exports = router;