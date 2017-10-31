

module.exports = {

    'facebookAuth' : {
        'clientID'           : process.env.FACEBOOK_APP_ID, // your App ID
        'clientSecret'       : process.env.FACEBOOK_APP_SECRET, // your App Secret
        'callbackURL'        : 'https://yelpcamp-asool.c9users.io/users/auth/facebook/callback',
        'profileFields'      : ['id', 'emails', 'name'] 
    }, 
    'googleAuth' : {
        'clientID'         : process.env.GOOGLE_CLIENT_ID,
        'clientSecret'     : process.env.GOOGLE_CLIENT_SECRET,
        'callbackURL'      : 'https://yelpcamp-asool.c9users.io/users/auth/google/callback'
    }
    
}