

module.exports = {

    'facebookAuth' : {
        'clientID'           : process.env.FACEBOOK_APP_ID, // your App ID
        'clientSecret'       : process.env.FACEBOOK_APP_SECRET, // your App Secret
        'callbackURL'        : 'https://yelpcamp-asool.c9users.io/users/auth/facebook/callback',
        'profileFields'      : ['id', 'emails', 'name'] 
    }
    
};
