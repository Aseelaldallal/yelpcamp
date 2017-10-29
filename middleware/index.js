// All the middleware goes here
// we named it index.js because if we require a directory, it will automatically require index. js

var indicative = require('indicative');
var Campground = require("../models/campground");
var Comment= require("../models/comment");
var sanitizeHtml   = require('sanitize-html');

const MAX_DESC_LENGTH = 800;
const MIN_DESC_LENGTH = 200;
const MAX_INPUT_LENGTH = 120;

var middlewareObj = {};



// ====================================================================
// Check campground owned by user
// ====================================================================

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

// ====================================================================
// Check comment owned by user
// ====================================================================

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

// ====================================================================
// Check that a user is logged in
// ====================================================================
middlewareObj.isLoggedIn = function(req,res, next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

// ====================================================================
// Sanitize HTML
// ====================================================================

// Sanitize html: https://www.npmjs.com/package/sanitize-html
middlewareObj.sanitizeUserInput = function(req,res,next) {
    for(var key in req.body) {
        if(req.body[key]) {
            req.body[key] = sanitizeHtml(req.body[key], { allowedTags: [], allowedAttributes:[]});
        }
    }
    return next(); 
};

// ====================================================================
// Validate Campground Post Form
// ====================================================================

middlewareObj.validateForm = function(req,res,next) {
    trim(req);
    //Count the number of new line characters (see http://bit.ly/2mKBW4K)
    var maxDescLength = MAX_DESC_LENGTH;
    if(req.body.desc) {
        var numberOfLineBreaks = (req.body.desc.match(/\n/g)||[]).length;
        maxDescLength = MAX_DESC_LENGTH + numberOfLineBreaks;
    }
     var descriptionRule = 'required|min:' + MIN_DESC_LENGTH + '|max:' + maxDescLength;
     var basicRule = 'required|max:' + MAX_INPUT_LENGTH;
     
     const messages = {
          'campName.required': 'Campground Name: required.',
          'location.required': 'Location: required',
          'desc.required': 'Description: required',
          'campName.max': 'Campground Name: Maximum number of characters exceeded',
          'location.max': 'Location: Maximum number of characters exceeded',
          'desc.max': 'Description: Maximum number of characters exceeded',
          'desc.min': 'Description: Minimum number of characters not met',
        };
        const rules = {
            campName: basicRule,
            location: basicRule,
            desc: descriptionRule
        };
        const data = {
            campName: req.body.campName,
            location: req.body.location,
            desc: req.body.desc
        };
        validate(data, rules, messages, req, res, next);
};

// ====================================================================
// Validate Registration Form
// ====================================================================

middlewareObj.validateRegisterationForm = function(req,res,next) { 
    trim(req);
    const rules = {
        username: 'required',
        email:    'required|email',
        password: 'required'
    }
    const messages = {
        'username.required': 'You must enter a username',
        'email.required': 'You must enter an email address',
        'email.email' : 'The email address you entered is invalid',
        'password.required' : 'You must enter a password'
    }
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    validate(data, rules, messages, req, res, next);
}

// ====================================================================
// Validate Registration Form
// ====================================================================

middlewareObj.validateLoginForm = function(req,res,next) { 
    trim(req);
    const rules = {
        email:    'required|email',
        password: 'required'
    }
    const messages = {
        'email.required': 'You must enter an email address',
        'email.email' : 'The email address you entered is invalid',
        'password.required' : 'You must enter a password'
    }
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    validate(data, rules, messages, req, res, next);
}

// ====================================================================
// Helper Methods
// ====================================================================


// Validate
function validate(data, rules, messages, req, res, next) {
    indicative
        .validateAll(data, rules, messages)
        .then(function() { // validation success
            return next();
        })
        .catch(function(errors) { // validation fail
            var validationErrors = getValidationErrors(errors);
            req.flash("error", validationErrors);
            res.redirect("back"); 
        });
}

// Trim user input
function trim(req) {
    for(var key in req.body) {
        req.body[key] = req.body[key].trim(); 
        if(req.body[key] == "") {
            req.body[key] = null;
        } 
    }
}



// Errors in an array of objects. Each object has a field, validation, and message. This function
// extracts message from each object, and compiles them into one string. It then returns the string.
function getValidationErrors(errors) {
    var messages = [];
    errors.forEach(function(msgObject) {
        messages.push(msgObject.message);
    });
    return messages;
}



module.exports = middlewareObj;