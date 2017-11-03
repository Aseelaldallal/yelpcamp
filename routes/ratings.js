var express     = require("express");
var router      = express.Router({mergeParams: true});
var Campground  = require("../models/campground");
var Rating      = require("../models/rating");
var middleware  = require("../middleware");


/* ------------------------------------- */
/* -------------CREATE ROUTE------------ */
/* ------------------------------------- */



router.post('/', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if(err) { console.log(err); }
		if (req.body.rating) {
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var rating = { 
                rating: req.body.rating,
                author: author
            };
            Rating.create(rating, function(err, createdRating) {
                if(err) { console.log(err); }
                campground.ratings.push(createdRating);
                campground.save();
                req.flash("success", "Successfully added rating");
                res.redirect('/campgrounds/' + campground._id);
            });
		} else {
			req.flash("error", "Please select a rating");
			res.redirect('/campgrounds/' + campground._id);
		}
	});
});

/* ------------------------------------- */
/* --------------UPDATE ROUTE----------- */
/* ------------------------------------- */

router.put("/:rating_id", middleware.isLoggedIn, function(req,res) {
    if(!req.body.rating) {
        req.flash("error", "You can't submit an empty rating");
        return res.redirect("/campgrounds/" + req.params.id);
    }
    Rating.findByIdAndUpdate(req.params.rating_id, {rating: req.body.rating}, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "Successfully edited your rating");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;

