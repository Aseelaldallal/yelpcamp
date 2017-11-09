
// script in cloud9

var mongoose        = require("mongoose"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    Rating          = require("./models/rating"),    
    faker           = require("faker"),
    GooglePlaces    = require('node-googleplaces'),
    fs              = require('fs'),
    request         = require('request'),
    aws             = require('aws-sdk'),
    bcrypt          = require('bcrypt-nodejs');
    


var numCampgrounds = 316; //manual
var numRatings = 5000;
var numUsers = 350;
var campgroundCatalog = new Array();
//var urlStart = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=";
//var urlEnd = "&key=" + process.env.GOOGLE_API_KEY;
   

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ca-central-1'
});

var s3 = new aws.S3();


/* ------------------------------------------------- */ 
/* ----------------- CREATE USERS ------------------ */
/* ------------------------------------------------- */ 

// Create random users and store them in DB
function generateUsers() {
    User.remove({}, function(err) {
       if(err) {
           console.log(err);
       } else {
            for(var i=0; i<numUsers; i++) {  
               createUser();
            }
       }
    });
}

// Creates a single random user, and adds it to User database
function createUser() {
    var newUser = new User({
        'local.username': faker.internet.userName(),
        'local.email': faker.internet.email().toLowerCase(),
        'local.password': bcrypt.hashSync("password", bcrypt.genSaltSync(8), null)
    });
    User.create(newUser, function(err, response) {
        if(err) {
            console.log(err);
        } 
    });
}


/* ------------------------------------------------- */ 
/* ---------------- CREATE COMMENTS ---------------- */
/* ------------------------------------------------- */ 

function generateComments() {
    fs.readFile("./seedData/places.json", 'utf8', function (err, data) {
        if (err) { console.log("ERROR: " + err); }
        campgroundCatalog = JSON.parse(data);
        createComments();
    });
}

    
function createComments() {
    campgroundCatalog.forEach(function(campground) {
       if(campground.comments) {
           campground.comments.forEach(function(comment) {
                if(comment.text !== "") {
                    var rand = Math.floor(Math.random() * numUsers); 
                    User.findOne().skip(rand).exec(function (err, commentAuthor) {
                        if(err) { console.log(err); }
                        var author = {
                             id: commentAuthor._id,
                             username: commentAuthor.local.username
                        }
                        var newComment = {
                            author: author,
                            text: comment
                        };
                        Comment.create(newComment, function(err,createdComment) {
                            if(err) { console.log(err) }; 
                        })
                    });
                } // end if   
           });
       } 
    });
}

/* ------------------------------------------------- */ 
/* --------------- CREATE CAMPGROUNDS -------------- */
/* ------------------------------------------------- */ 

// name, image, location, latlng, description, comments, author
// name, location, latlng
function generateCampgrounds() {
    fs.readFile("./seedData/places.json", 'utf8', function (err, data) {
        if (err) { console.log("ERROR: " + err); }
        campgroundCatalog = JSON.parse(data);
        createCampgrounds();
    });
}

    
function createCampgrounds() {
    campgroundCatalog.forEach(function(campground) {
        var rand = Math.floor(Math.random() * numUsers); 
        User.findOne().skip(rand).exec(function (err, author) {
            if(err) { console.log(err); }
            var author = {
                 id: author._id,
                 username: author.local.username
            }
            var ground = { 
                name: campground.name,
                location: campground.location,
                googlePlaceID: campground.googlePlaceID,
                latlng: campground.latlng,
                country: campground.country,
                description: faker.lorem.paragraphs(),
                image: "uploads/" + campground.googlePlaceID + ".jpg",
                author: author
            };
            Campground.create(ground, function(err, newGround) {
                if(err) {console.log(err); }
            });
        });
    });
}


/* ------------------------------------------------- */ 
/* ----------------- CREATE RATINGS ---------------- */
/* ------------------------------------------------- */ 

function generateRatings() {
    for(var i=0; i<numRatings; i++) {
        var rand = Math.floor(Math.random() * numUsers); 
        User.findOne().skip(rand).exec(function (err, ratingAuthor) {
            if(err) { console.log(err); }
            var author = {
                id: ratingAuthor._id,
                username: ratingAuthor.username
            }
            var rating = getRandomRating(); 
            var ratingDoc = {
                rating: rating,
                author: author
            }
            Rating.create(ratingDoc, function(err, createdRating) {
                if(err) { console.log(err); }
                var crand = Math.floor(Math.random() * numCampgrounds);
                Campground.findOne().skip(crand).exec(function (err, randomCampground) {
                    if(err) {console.log(err); }
                    randomCampground.ratings.push(createdRating);
                    randomCampground.save();
                });
            });
        });
    }
}

function getRandomRating() {
    var rating = Math.random() * 5;
    rating = Math.round(rating * 10.0) / 10.0;
    if(rating > 5) { rating = 5;  }
    if(rating < 0.1) { rating = 0.1; }
    return rating; 
}




/* ------------------------------------------------- */ 
/* ----------- LINK COMMENT TO CAMPGROUND ---------- */
/* ------------------------------------------------- */ 


function linkCampgroundsToComments() {
    fs.readFile("./seedData/places.json", 'utf8', function (err, data) {
        if (err) { console.log("ERROR: " + err); }
        campgroundCatalog = JSON.parse(data);
        link();
    });
}



function link() {
    campgroundCatalog.forEach(function(campground) {
        if(campground.comments) {
            campground.comments.forEach(function(comment) {
                Comment.findOne({'text': comment}, function(err, foundComment) { // Find it in DB
                    if(err) { console.log(err); }
                    Campground.update({'googlePlaceID': campground.googlePlaceID}, { $addToSet: {comments: foundComment }}, function(err, numUpdated) {
                       if(err) {console.log(err)};
                       Campground.findOne({'googlePlaceID': campground.googlePlaceID}, function(err, updatedGround) {
                           if(err) {console.log(err)}
                           var commentCampground = {
                               id: updatedGround._id,
                               name: updatedGround.name
                           }
                           foundComment.campground = commentCampground;
                           foundComment.save();
                       }); // End of campground.find
                    }); // End of campground.update
                }); // End comment.findOne
            }); // End campground.comments.forEach
        } // End if
    }); // End forEach
}



//db.campgrounds.update({}, {$pull: {comments: {$exists: true}}}, {multi: true})





/* ------------------------------------------------- */ 
/* -------------- Upload Images to S3 -------------- */
/* ------------------------------------------------- */ 

function uploadImagesToS3() {
    var x = 0;
    console.log("In upload to S3");
    fs.readFile("./seedData/places.json", 'utf8', function (err, data) {
        if (err) { console.log("ERROR: " + err); }
        campgroundCatalog = JSON.parse(data);
        campgroundCatalog.forEach(function(campgroundInstance) {
            var urlStart = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=";
            var img = campgroundInstance.image;
            var urlEnd = "&key=AIzaSyAvsl7KOmIyQalzMse5idBGElZa8GOdPG0";
            var imgUrl = urlStart + img + urlEnd;
            campgroundInstance.imageModified = campgroundInstance.googlePlaceID + ".jpg";
            var options = {
                url: imgUrl,
                encoding: null
                
            }
            request(options, function(error, response, body) {
                if (error || response.statusCode !== 200) { 
                    console.log("ERROR");
                    console.log(error);
                } else {
                    s3.putObject({
                        Body: body,
                        Key: "uploads/" + campgroundInstance.googlePlaceID + ".jpg",
                        Bucket: process.env.S3_BUCKET_NAME
                    }, function(error, data) { 
                        if (error) {
                            console.log("error downloading image to s3");
                        } else {
                            console.log("success uploading to s3: " + x);
                            x++;
                        }
                    }); 
                }   
            });
            
        });
    });
}

/* ------------------------------------------------- */ 
/* -------------------- SEEDDB --------------------- */
/* ------------------------------------------------- */ 

function seedDB() {
    //uploadImagesToS3();
    //generateUsers(); 
   //generateComments();
   //generateCampgrounds();
    //generateRatings(); 
    //linkCampgroundsToComments();
}


module.exports = seedDB; 