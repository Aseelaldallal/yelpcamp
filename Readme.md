# Yelp Camp


## Summary

YelpCamp is a RESTful web-app I made to get more comfortable using Node.js, MongoDB and express. 

**This website is not intended for public use. Please note that all campground ratings are randomly generated and some of the data is fake (randomly generated).**

YelpCamp allows users to:

- Search for Campgrounds by Country
- Signup with an email address, facebook, or google
- Post Campgrounds
- Rate Campgrounds
- Comment on Campgrounds

This is my second web app. I thought I'd outline my thought process here, in case you have questions about decisions I made when coding. I'd appreciate your feedback!

![yelp1](https://i.imgur.com/qmgzcyR.png "")

**App Link:** https://aseel-yelpcamp.herokuapp.com/

## Stack and Features

**Stack:** NodeJS, Express, MongoDB

**Features:**
- RestFUL Routing with express and mongoose
- Authentication (Local, Facebook, Google) using Passport.js
- Image storage via Amazon S3
- Google Maps API to render campsite location
- Google Places API to populate DB 
- Search by Country Feature
- Deployed on Heroku
- Database hosted on mLab
- EJS for templating
- Responsive Design using Bootstrap

![yelp2](https://i.imgur.com/yGVm9qo.png "")

## Where is the Campground data coming from?

I wrote a script to extract around 300 campgrounds from around the world using Google Places API. You can view the extracted data [here](https://aseel-yelpcamp.herokuapp.com/seedData). (Use a JSON formatter extension) The extracted data consists of the following:

- Campground Name
- Campground Location
- Campground Image
- Campground Google Place ID
- Latitude and Longitude
- Comments

You can view the script to extract campground data using google places API [here](https://github.com/Aseelaldallal/extractCampgroundsFromGoogleScript/blob/master/app.js).

**Note:** It would have been better to use Factual's API rather than Google Places API, since the latter isn't really meant to be used the way I did. Factual wouldn't supply comments and images though.

## How was the DB populated?

I wrote a script that:

- Creates random users using Faker
- Creates random ratings
- Creates campgrounds using the extracted campground data
- Uploads each campground image to Amazon S3
- Randomly associates a user with a campground, and ratings with a campground

You can view the script [here](https://github.com/Aseelaldallal/yelpcamp/blob/master/seeds.js).

## Testing the App

Feel free to test the functionality of this website by signing up and creating/editing campgrounds, comments and ratings. I wrote a script to create 350 random users. You can login as any of those users and test the functionality of the website. Here are a few test users:

- Email: melvina.dietrich@yahoo.com ; Password: password
- Email: octavia_glover2@hotmail.com ; Password: password
- Email: alexys_hahn@yahoo.com ; Password: password
- Email: treva_hilpert@hotmail.com ; Password: password
- Email: alyce.halvorson@gmail.com ; Password: password

You can also create your own account and add/edit campgrounds, ratings or comments

