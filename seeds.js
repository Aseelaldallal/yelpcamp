

var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var desc = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
var campgrounds = [
    { name: "Cloud's Rest", image: "https://farm1.staticflickr.com/112/316612921_f23683ca9d.jpg" , description: desc },
    { name: "Desert Mesa", image: "https://farm7.staticflickr.com/6186/6090714876_44d269ed7e.jpg", description: desc },
    { name: "Nightmare before Christmas", image: "https://farm7.staticflickr.com/6210/6090170567_6df55f8d83.jpg" , description: desc  }
]



// populate db with comments and campgrounds
function seedDB() {
    Campground.remove({}, function(err) {
        if(err) {
            console.log(err);
        } else {
            Comment.remove({}, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    campgrounds.forEach(function(ground) {
                        Campground.create(ground, function(err, newGround) {
                            if(err) {
                                console.log(err);
                            } else {
                                // Create comment and associate it with newGround
                                Comment.create( 
                                    {
                                        text: "This was great, I look just like bob marley",
                                        author: "Mohamad Mortada"
                                    }, function(err, newComment) {
                                        if(err) {
                                            console.log(err);
                                        } else { // associate with newGround
                                            newGround.comments.push(newComment);
                                            newGround.save();
                                        }
                                    } 
                                ); // End of comment create
                            } // End of create else
                        }); // End of Campground create
                    }); // End of forEach
                } // of comments remove else
            }); // End of comments remove
        } // End of campground remove else
    }); // End of campground remove
    
}



module.exports = seedDB; 