

module.exports = {

    'facebookAuth' : {
        'clientID'           : process.env.FACEBOOK_APP_ID, // your App ID
        'clientSecret'       : process.env.FACEBOOK_APP_SECRET, // your App Secret
        'callbackURL'        : 'https://aseel-yelpcamp.herokuapp.com/users/auth/facebook/callback',
        'profileFields'      : ['id', 'emails', 'name'] 
    }, 
    'googleAuth' : {
        'clientID'         : process.env.GOOGLE_CLIENT_ID,
        'clientSecret'     : process.env.GOOGLE_CLIENT_SECRET,
        'callbackURL'      : 'https://aseel-yelpcamp.herokuapp.com/users/auth/google/callback'
    }
    
}