// All the middleware goes here
// we named it index.js because if we require a directory, it will automatically require index. js

var Campground = require("../models/campground");
var Comment= require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err,foundGround) {
            if(err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // Does user own campground? 
                if(foundGround.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        // Check if the user owns the comment
       Comment.findById(req.params.comment_id, function(err, foundComment) {
           if(err) {
               console.log(err);
           } else {
               if(foundComment.author.id.equals(req.user._id)) {
                   next(); 
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
           }
       });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


middlewareObj.isLoggedIn = function(req,res, next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;