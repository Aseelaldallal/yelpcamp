

/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */


var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware") // we named it index.js because if we require a directory, it will automatically require index.js


/* ------------------------------------- */
/* -----------------ROUTES-------------- */
/* ------------------------------------- */



// INDEX ROUTE - Show all campgrounds

router.get("/", function(req,res) {
   // Get all campgrounds from db
   Campground.find({}, function(err, allcampgrounds) {
       if (err) {
           console.log(err);
       } else {
             res.render("campground/index", {campgrounds: allcampgrounds}); 
       }
   })
});


// CREATE ROUTE -- Add new campground to database
router.post("/", middleware.isLoggedIn, middleware.sanitizeUserInput, middleware.validateForm,  function(req,res) {
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { 
        name: req.body.campName, 
        location: req.body.location,
        latlng: req.body.mapCoord,
        description: req.body.desc, 
        image: req.body.imgURL,
        author: author
    };
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        } else {
             res.redirect("/campgrounds");
        }
    })
});

// NEW ROUTE - show form to create new campground

router.get("/new", middleware.isLoggedIn, function(req,res) {
   res.render("campground/new"); 
});


// SHOW ROUTE - shows more info about one campground

router.get("/:id", function(req,res) {
    //find the campground with provided ID
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec(function(err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("campground/show", {campground: foundCampground} );
        }
    });
 
});

// EDIT ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res) {
    
    Campground.findById(req.params.id, function(err, foundGround) {
        if(err) {
            console.log(err);
        } else {
            console.log(foundGround);
            res.render("../views/campground/edit", {campground: foundGround});
        }
    });
});



// UPDATE ROUTE
// NEED TO FIGURE OUT ALLOWING HTML
router.put("/:id", middleware.checkCampgroundOwnership,  middleware.validateForm, function(req,res) {
    var updatedGround = { 
        name: req.body.campName, 
        location: req.body.location,
        latlng: req.body.mapCoord,
        description: req.body.desc, 
        image: req.body.imgURL
    }
    Campground.findByIdAndUpdate(req.params.id, updatedGround, function(err, updatedGround) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});



// DESTROY ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err, deletedGround) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});


/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */



module.exports = router;