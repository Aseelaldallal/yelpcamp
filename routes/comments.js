




/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */

var express = require("express"),
    router = express.Router({mergeParams: true}), // Preserve the req.params values from the parent router.
    Campground = require("../models/campground"),
    Comment = require("../models/comment"), 
    middleware = require("../middleware"),
    moment          = require("moment"),
    momentTZ        = require("moment-timezone"),
    ipLocation      = require("iplocation");



/* ------------------------------------- */
/* ---------------NEW ROUTE------------- */
/* ------------------------------------- */

router.get("/new", middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function(err, foundC) {
        if(err) {
            console.log(err);
        } else {
            res.render("comment/new", {campground: foundC});
        }
    });
});



/* ------------------------------------- */
/* -------------CREATE ROUTE------------ */
/* ------------------------------------- */

router.post("/", middleware.isLoggedIn, middleware.sanitizeUserInput, function(req,res) {
    if(!req.body.comment) {
        req.flash("error", "You can't submit an empty comment");
        return res.redirect("/campgrounds/" + req.params.id);
    }
    Campground.findById(req.params.id, function(err, foundGround) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create({text: req.body.comment}, function(err, createdComment) {
                if(err) {
                    req.flash("error", err);
                    res.redirect("back");
                } else {
                    // Add user, campground, date to comment
                    createdComment.author.id = req.user._id;
                    createdComment.author.username = req.user.username;
                    createdComment.campground.id = foundGround._id;
                    createdComment.campground.name = foundGround.name;
                    createdComment.save(); 
                    // save comment
                    foundGround.comments.push(createdComment);
                    foundGround.save();
                    req.flash("success", "Successfully added comment")
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }); // End of Comment.create
        }
    }); // End of Campground.findById()
});

/* ------------------------------------- */
/* --------------EDIT ROUTE------------- */
/* ------------------------------------- */

router.get("/:comment_id/edit", middleware.checkCommentOwnership,  function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comment/edit", {comment: foundComment, campground_id: req.params.id});
        }
    });
});

/* ------------------------------------- */
/* -------------UPDATE ROUTE------------ */
/* ------------------------------------- */

router.put("/:comment_id", middleware.checkCommentOwnership, middleware.sanitizeUserInput, function(req, res) {
    if(!req.body.comment) {
        req.flash("error", "You can't submit an empty edit");
        return res.redirect("/campgrounds/" + req.params.id);
    }
    Comment.findByIdAndUpdate(req.params.comment_id, {text: req.body.comment}, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
             res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

/* ------------------------------------- */
/* ------------DESTROY ROUTE------------ */
/* ------------------------------------- */

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
/* ----------------HELPER--------------- */
/* ------------------------------------- */

// Returns user's IP Address
function getUserIPAddress(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
}



/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */

module.exports = router; 