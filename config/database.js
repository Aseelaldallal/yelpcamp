

var url =  process.env.DB_URL || "mongodb://localhost/yelp_camp";

module.exports = {

    'url' : url

};

// 'mongodb://localhost/yelp_camp' 
// process.env.DB_URL