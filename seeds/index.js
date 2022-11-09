//copied from app.js to require mongoose and connect to the db.
const mongoose = require('mongoose');
const Campground = require('../models/campground'); // modified:   ".." <- this 2 dots mean have to go 2 steps to the proper directory(or something like that)

//Import from cities.js
const cities = require('./cities'); 
//Import from seedHelpers.js
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


//takes a random sample from an array

const sample = array => array[Math.floor(Math.random() * array.length)]; 

//Function to randomize 50 cities and save them with random title on the db

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000); 
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`, 
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

//execute the function and close session

seedDB().then(() => {
    db.close();
})