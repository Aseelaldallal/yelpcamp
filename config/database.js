

var url =  process.env.DATABASEURL || "mongodb://localhost/yelp_camp";

module.exports = {

    'url' : url

};

// 'mongodb://localhost/yelp_camp' 
// process.env.DB_URL