var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        },
        username: String
    },
    campground: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "campground"
        }, 
        campgroundName: String
    },
    date: Date
});

module.exports = mongoose.model("Comment", commentSchema);