var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    location: String, 
    latlng: String,
    description: String,
    country: String,
    googlePlaceID: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }, 
        username: String
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);