


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    passport        = require("passport"),
    User            = require("../models/user"),
    Campground      = require("../models/campground"),
    Comment         = require("../models/comment"), 
    middleware      = require("../middleware"),
    router          = express.Router();    


/* --------------------------- INDEX ROUTE --------------------------- */

// Get a list of all users, we don't want that -- 404

/*router.get("/", function(req,res) {
   console.log("NOTHING HERE");
});*/

/* ------------------------------------------------------------------- */
/* ---------------------------- NEW ROUTE ---------------------------- */
/* ------------------------------------------------------------------- */

router.get("/new", function(req,res) {  
    res.render("user/new");
});

/* ------------------------------------------------------------------- */
/* --------------------------- CREATE ROUTE -------------------------- */
/* ------------------------------------------------------------------- */

/* ------------------- LOCAL SIGNUP ------------------- */

// process the signup form
router.post('/',  middleware.sanitizeUserInput, middleware.validateRegisterationForm, passport.authenticate('local-signup', {
    failureRedirect : 'users/new', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}), function(req,res) {
    // Success
    req.flash("success", "Welcome to YelpCamp " + req.user.local.username + "!");
    res.redirect(`/users/${req.user._id}/`);
});

/* ------------------- FACEBOOK SIGNUP ------------------- */


// send to facebook to do the authentication
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get(
    '/auth/facebook/callback',
     passport.authenticate('facebook', {
        failureRedirect : 'users/new', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }), 
    function(req,res) {
        req.flash("success", "Welcome to YelpCamp " + req.user.facebook.username + "!");
        res.redirect(`/users/${req.user._id}/`);
    }
);


/* -------------------- GOOGLE SIGNUP -------------------- */

// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get(
    '/auth/google/callback',
     passport.authenticate('google', {
        failureRedirect : 'users/new', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }), 
    function(req,res) {
        req.flash("success", "Welcome to YelpCamp " + req.user.google.username + "!");
        res.redirect(`/users/${req.user._id}/`);
    }
);


/* ------------------------------------------------------------------- */
/* ---------------------------- SHOW ROUTE --------------------------- */
/* ------------------------------------------------------------------- */

router.get("/:id", function(req,res,next) { 
    User.findById(req.params.id).exec(function(err, foundUser) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Campground.find( { 'author.id' : req.params.id } ).populate("ratings").exec(function(err, foundGrounds) {
               if(err) {
                   req.flash("error", err.message);
                   res.redirect("back");
               } else {
                   Comment.find({ 'author.id' : req.params.id }).exec(function(err, foundComments) {
                        if(err) {
                            req.flash("error", err.message);
                            res.redirect("back");
                        } else {
                            res.render("user/show", {user:foundUser, campgrounds : foundGrounds, comments: foundComments});
                        }
                    }); // End of comment.find
                }
            }); // End of campgrounds.find
        }
    }); // End of user.find
});


/* ------------------------------------------------------------------- */
/* ---------------------------- EDIT ROUTE --------------------------- */
/* ------------------------------------------------------------------- */

// None , no need since we don't keep info about users
/*router.get("/:id/edit", function(req,res) {
        
});*/

/* ------------------------------------------------------------------- */
/* --------------------------- UPDATE ROUTE -------------------------- */
/* ------------------------------------------------------------------- */
// none, since no edit route
/*router.put("/:id", function(req, res) {

});*/

/* ------------------------------------------------------------------- */
/* --------------------------- DESTROY ROUTE ------------------------- */
/* ------------------------------------------------------------------- */

// none, since user can't delete his account
/*router.delete("/:id", function(req,res) {

});*/


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */

module.exports = router;