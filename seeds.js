
// script in cloud9

var mongoose        = require("mongoose"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    faker           = require("faker"),
    GooglePlaces    = require('node-googleplaces'),
    fs              = require('fs'),
    request         = require('request'),
    aws             = require('aws-sdk');
    



// API KEY
const places = new GooglePlaces('AIzaSyAvsl7KOmIyQalzMse5idBGElZa8GOdPG0');

var numUsers = 220;
var campgroundCatalog = new Array();
//var urlStart = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=";
//var urlEnd = "&key=AIzaSyAvsl7KOmIyQalzMse5idBGElZa8GOdPG0";
   

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
        username: faker.internet.userName()
    });
    User.register(newUser, "password", function(err, response) {
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
                var rand = Math.floor(Math.random() * numUsers); 
                User.findOne().skip(rand).exec(function (err, commentAuthor) {
                    if(err) { console.log(err); }
                    var author = {
                         id: commentAuthor._id,
                         username: commentAuthor.username
                    }
                    var newComment = {
                        author: author,
                        text: comment
                    };
                    Comment.create(newComment, function(err,createdComment) {
                        if(err) { console.log(err) }; 
                    })
                });
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
                 username: author.username
            }
            var ground = { 
                name: campground.name,
                location: campground.location,
                googlePlaceID: campground.googlePlaceID,
                latlng: campground.latlng,
                country: campground.country,
                description: campground.description,
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
                if(comment !== "") {
                    Comment.findOne({'text': comment}, function(err, foundComment) { // Find it in DB
                        if(err) { console.log(err); }
                        Campground.update({'googlePlaceID': campground.googlePlaceID}, { $addToSet: {comments: foundComment }}, function(err, updatedGround) {
                           if(err) {console.log(err)};  
                        });
                    }); // End comment.findOne
                }
            }); // End campground.comments.forEach
        } // End if
    }); // End forEach
}



//db.campgrounds.update({}, {$pull: {comments: {$exists: true}}}, {multi: true})





/* ------------------------------------------------- */ 
/* -------------- Upload Images to S3 -------------- */
/* ------------------------------------------------- */ 

function uploadImagesToS3() {
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
                            console.log("success uploading to s3");
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
    //linkCampgroundsToComments();
}


module.exports = seedDB; 