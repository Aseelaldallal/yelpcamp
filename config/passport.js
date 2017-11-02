// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../models/user');

// Get Credentials
var configAuth = require('./auth.js');

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
        usernameField : 'email', // by default, local strategy uses username and password, we will override with email
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email) { email = email.toLowerCase(); } // Use lower-case e-mails to avoid case-sensitive e-mail matching
        process.nextTick(function() {
            if (!req.user) { // if the user is not already logged in:
                User.findOne({'local.email': email}, function(err, user) {
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

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email) { email = email.toLowerCase(); }
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, req.flash('error', 'No such email address exists.'));
                } else if (!user.validPassword(password)) {
                    return done(null, false, req.flash('error', 'Incorrect Password'));
                } else {
                    return done(null, user);
                }
            });
        });
    }));
    
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : configAuth.facebookAuth.profileFields
    },
    function(token, refreshToken, profile, done) {     // facebook will send back the token and profile
        process.nextTick(function() {
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err) { return done(err); }
                if (user) { // if the user is found, then log them in
                    return done(null, user); // user found, return that user
                } else { // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.facebook.id = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user        
                    newUser.facebook.username  = createUsername(profile);
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err) { throw err; }
                        return done(null, newUser);
                    });
                }
            });
        });

    }));
    
    
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err) { return done(err); }
                if (user) {
                    return done(null, user);
                } else {
                    var newUser          = new User();
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.username  = profile.displayName;
                    newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                    newUser.save(function(err) {
                        if (err) { return done(err); }
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    
   
}; // module.exports end


// =========================================================================
// HELPER ==================================================================
// =========================================================================
    

function createUsername(profile) {
    var username = undefined;
    if(profile.username) {
        username = profile.username;
    } else if(profile.displayName) {
        username = profile.displayName;
    } else if(profile.name) {
        if(profile.name.givenName && profile.name.middleName && profile.name.familyName) {
            username = profile.name.givenName + " " + profile.name.middleName +  " " + profile.name.familyName;
        } else if (profile.name.givenName && profile.name.familyName) {
            username = profile.name.givenName + " " + profile.name.familyName;
        } else {
            username = profile.name.givenName;
        }
    } 
    return username;
}