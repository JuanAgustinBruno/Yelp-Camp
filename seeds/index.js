//copied from app.js to require mongoose and connect to the db.
const mongoose = require('mongoose');
const Campground = require('../models/campground'); // modified:   ".." <- this 2 dots mean have to go 2 steps to the proper directory(or something like that)

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

//function to delete everything from database collection , create new entry and save.

const seedDB = async () => {
    await Campground.deleteMany({});
    const c = new Campground({ title: "purple field"});
    await c.save();
}
//execute the function

seedDB();