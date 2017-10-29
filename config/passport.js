// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../models/user');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email) { email = email.toLowerCase(); } // Use lower-case e-mails to avoid case-sensitive e-mail matching
        process.nextTick(function() {
            if (!req.user) { // if the user is not already logged in:
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err) { return done(err); }
                    if (user) {
                        return done(null, false, req.flash('error', 'That email is already taken.'));
                    } else {
                        // create the user
                        var newUser            = new User();
                        newUser.local.username = req.body.username;
                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err) { return done(err); }
                            return done(null, newUser);
                        });
                    }
                });
            } else { //A user is already logged in. This actually will never run since signup button dissapears on login
                return done(null, false, req.flash('error', 'You are already logged in.'));
            }

        });

    }));

    
};
