var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name:         {type: String, required: true},
    image:        {type: String, required: true},
    location:     {type: String, required: true}, 
    latlng:       {type: String, required: true},
    description:  {type: String, required: true},
    country:      {type: String, required: true},
    avgRating:    {type: Number},
    googlePlaceID: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment"
        }
    ],
    ratings: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Rating"
      }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true
        }, 
        username: {type: String, required: true}
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);