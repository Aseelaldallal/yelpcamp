




/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */

var express = require("express");
var router = express.Router({mergeParams: true}); // Preserve the req.params values from the parent router.
var Campground = require("../models/campground");
var Comment = require("../models/comment"); 
var middleware = require("../middleware")


/* ------------------------------------- */
/* -----------------ROUTES-------------- */
/* ------------------------------------- */


// NEW ROUTE - show form to create new comment

router.get("/new", middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function(err, foundC) {
        if(err) {
            console.log(err);
        } else {
            res.render("comment/new", {campground: foundC});
        }
    });
});


// CREATE ROUTE

router.post("/", middleware.isLoggedIn,  function(req,res) {
    Campground.findById(req.params.id, function(err, foundGround) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, createdComment) {
                if(err) {
                    req.flash("error", err);
                    console.log(err);
                } else {
                    // Add username and id to comment
                    createdComment.author.id = req.user._id;
                    createdComment.author.username = req.user.username;
                    createdComment.save(); 
                    // save comment
                    foundGround.comments.push(createdComment);
                    foundGround.save();
                    req.flash("success", "successfully added comment")
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }); // End of Comment.create
        }
    }); // End of Campground.findById()
});


// EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comment/edit", {comment: foundComment, campground_id: req.params.id});
        }
    });
});

// UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
             res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment) {
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});






/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */

module.exports = router; 