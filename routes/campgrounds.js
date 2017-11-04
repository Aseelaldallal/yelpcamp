

/* ------------------------------------- */
/* -----------------SETUP--------------- */
/* ------------------------------------- */


var express         = require("express"),
    router          = express.Router(),
    Campground      = require("../models/campground"),
    Comment         = require("../models/comment"),
    Rating          = require("../models/rating"),
    middleware      = require("../middleware"),
    aws             = require('aws-sdk'),
    multer          = require('multer'),
    multerS3        = require('multer-s3'),
    ipapi           = require('ipapi.co');

/* ------------------------------------- */
/* ---------IMAGE UPLOAD SETUP---------- */
/* ------------------------------------- */

const MAX_FILE_SIZE = 1000000;

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ca-central-1'
});

var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            var fileExtension = file.originalname.split(".")[1];
            var path = "uploads/" + req.user._id + Date.now() + "." + fileExtension;
            cb(null, path); 
        }
    })
});


/* ------------------------------------- */
/* --------------INDEX ROUTE------------ */
/* ------------------------------------- */


router.get("/", function(req,res) {
   // Get all campgrounds from db
   if(Object.keys(req.query).length === 0) {
       var ip = getUserIPAddress(req);
       ipapi.location(function(ipapiRes) {
           findCampgrounds(ipapiRes.country_name, ipapiRes.country, req,res);
       }, ip);
   } else {
       var country = req.query.country.trim();
       if(country.indexOf("(") !== -1) {
           country = country.substring(0, country.indexOf("(")).trim();
       }
       findCampgrounds(country, req.query.country_code, req,res);
   }
});

function findCampgrounds(countryName, countryCode, req, res) {
    Campground.find({country: countryName}).populate("ratings").exec(function(err, allCampgrounds) {
       if (err) {
            flashUnexpectedError(req, res, err);
       } else {
            res.render("campground/index", {campgrounds: allCampgrounds, countryCode: countryCode, country: countryName}); 
       }
    })
};


    
    


/* ------------------------------------- */
/* -------------CREATE ROUTE------------ */
/* ------------------------------------- */

router.post("/", upload.array('image',1), middleware.isLoggedIn, middleware.sanitizeUserInput, middleware.validateForm, function(req,res) {
    validateFiles(req,res);
    if(!req.files[0]) {
        req.flash("error", "You must upload an image file");
        return res.redirect("back");
    } 
    var filepath = req.files[0].key; // 'uploads/xxxxx.extension'
    var author = {
        id: req.user._id,
        username: req.user.local.username || req.user.facebook.username || req.user.google.username
    };
    var newCampground = { 
        name: req.body.campName, 
        location: req.body.location,
        latlng: req.body.mapCoord,
        country: req.body.campgroundCountry,
        description: req.body.desc, 
        image: filepath,
        author: author
    };
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) { 
            flashUnexpectedError(req, res, err);
        } else  {
            req.flash("success", "Successfully created campground");
            res.redirect("/campgrounds/" + newlyCreated._id);
        }
    });
});



/* ------------------------------------- */
/* ---------------NEW ROUTE------------- */
/* ------------------------------------- */

router.get("/new", middleware.isLoggedIn, function(req,res) {
   res.render("campground/new"); 
});


/* ------------------------------------- */
/* ---------------SHOW ROUTE------------ */
/* ------------------------------------- */

router.get("/:id", function(req,res) {
    var id = req.params.id;
    Campground.findById(id).populate("comments").populate("ratings").exec(function(err, foundCampground) {
        if(err) { flashUnexpectedError(req, res, err);
        } else  {
            res.render("campground/show", {campground: foundCampground} );
        }
    });
 
});

/* ------------------------------------- */
/* ---------------EDIT ROUTE------------ */
/* ------------------------------------- */

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findById(req.params.id, function(err, foundGround) {
        if(err) {
            console.log(err);
        } else {
            res.render("../views/campground/edit", {campground: foundGround});
        }
    });
});



/* ------------------------------------- */
/* --------------UPDATE ROUTE----------- */
/* ------------------------------------- */

router.put("/:id", upload.array('image',1), middleware.checkCampgroundOwnership,  middleware.validateForm, function(req,res) {
    validateFiles(req,res);
    if(req.files && req.files[0]) { 
        req.body.image = req.files[0].key; // Path of uploaded file
        if(req.body.previousImage !== undefined) {
            deleteFiles(req.body.previousImage);
        } 
    } else if(req.body.imageRemoved === "true" && !req.files) {
        req.flash("error", "You must upload an image");
        return res.redirect('back');
    } else if(req.body.imageRemoved === "false") {
        req.body.image = req.body.previousImage;
    }
    var updatedGround = { 
        name: req.body.campName, 
        location: req.body.location,
        latlng: req.body.mapCoord,
        country: req.body.campgroundCountry,
        description: req.body.desc, 
        image: req.body.image
    }
    Campground.findByIdAndUpdate(req.params.id, updatedGround, function(err, updatedGround) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});



/* ------------------------------------- */
/* -------------DESTROY ROUTE----------- */
/* ------------------------------------- */
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err, deletedGround) {
        if(err) {
            console.log(err);
        } else {
            deleteFiles(deletedGround.image);
            Comment.remove({'_id': { $in: deletedGround.comments}}, function(err, docs){
                if(err) { console.log(err); }
                req.flash("success", "Successfully deleted campground: ", deletedGround.name);
                res.redirect("/users/" + deletedGround.author.id);
            });
        }
    });// End of campground.remove
});




/* ------------------------------------- */
/* ---------------HELPER---------------- */
/* ------------------------------------- */

// Delete image from s3
function deleteFiles(imagePath) {
    s3.deleteObjects({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
            Objects: [
                 { Key: imagePath },
            ]
        }
    }, function(err, data) {
        if (err) {
            console.log("Couldn't delete image file: " + err);
        }
    });
}

// Validates that the user uploaded file, file is an image, file size is less than
// MAX_FILE_SIZE
function validateFiles(req,res) {
    if(req.files && req.files[0]) {
        var imageType = /^image\//;
        if(!imageType.test(req.files[0].mimetype)) {
            deleteFiles(req.files[0].key);
            req.flash("error", "You can only upload an image file");
            return res.redirect("back");
        } else if(req.files[0].size > MAX_FILE_SIZE) {
            deleteFiles(req.files[0].key);
            req.flash("error", "Cannot Upload Image: Your file size exceeds the Maximum File Size of " + MAX_FILE_SIZE/1000000 + " MB.");
            return res.redirect("back");
        } 
    }
}

// Show error via flash
function flashUnexpectedError(req, res, err) {
    req.flash("error", "Unexpected Error: " + err.message + ". Try again later");
    res.redirect("back");
}

// Returns user's IP Address
function getUserIPAddress(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
}


/* ------------------------------------- */
/* ---------------- EXPORT ------------- */
/* ------------------------------------- */



module.exports = router;