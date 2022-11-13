
//require express to run the server
const express = require('express');
const app = express();

//request express to parse the body

app.use(express.urlencoded({ extended: true }));

//require method override to fake put requests for forms

const methodOverride = require("method-override");
app.use(methodOverride("_method"))

//require mongoose 
const mongoose = require('mongoose');

//connect to data base
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true, (not supported by Mongoose)
    //https://www.mongodb.com/community/forums/t/option-usecreateindex-is-not-supported/123048/4
    useUnifiedTopology: true
});


//db set as shortcut of mongoose.connection
const db = mongoose.connection;

//logic to check if there is an error
db.on("error", console.error.bind(console, "connection error:"));

//logic for succesfull connection
db.once("open", () => {
    console.log("Database connected");
});


//require model

const Campground = require('./models/campground');



//set the template engine to use
app.set('view engine', 'ejs');

//set template functions for the EJS template engine

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);


//sets the path to views folder
const path = require('path');
app.set('views', path.join(__dirname, 'views'))


//request to localhost:3000/

app.get('/', (req, res) => {
    res.render("home") // "home" stands for home.ejs, not just a string
});

//request Campgrounds

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//request campgrounds/new

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//error handling on async request to create new campground

app.post('/campgrounds', async (req, res, next) => {
    try {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
    } catch(e) {
        next(e)
    }
})

//request campgrounds by id to render on show.ejs (/:id can create confilct with other requests so mast be placed last)

app.get('/campgrounds/:id', async (req, res,) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
});


//edit campground 

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
})

//request put /campgrounds/_id , find and update on db, redirect to the campground

/* What is in req params?
params is an object of the req object that contains route parameters. 
If the params are specified when a URL is built, then the req. 
params object will be populated when the URL is requested. */

/* What does req.body? 
The req. body object allows you to access data in a string or JSON object from the client side.
 You generally use the req. body object to receive data through POST and PUT requests 
 in the Express server. */

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; //req.params will take the id from the url
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});

//request to delete using mongoose method findByIdAndDelete
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

//Basic error handler  - 445

app.use((err, req, res, next) => {
    res.send("Something went wrong")
    console.log("stupid user")
})

//set port listening

app.listen(3000, () => {
    console.log('Serving on port 3000')
})