
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

//require function that catches errors async functions

const catchAsync = require("./utils/catchAsync");


//require the ExpressError class

const ExpressError = require("./utils/ExpressError");


//require joi validation scheema

const { campgroundSchema, reviewSchema } = require('./schemas.js');

//define middleware for joi validation

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



//request to localhost:3000/

app.get('/', (req, res) => {
    res.render("home") // "home" stands for home.ejs, not just a string
});

//request Campgrounds

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//request campgrounds/new

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//error handling on async request to create new campground

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
        if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
 }));

//request campgrounds by id to render on show.ejs (/:id can create confilct with other requests so mast be placed last)

app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));


//edit campground 

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

//sends edit ,request put /campgrounds/_id , find and update on db, redirect to the campgrounds

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //req.params will take the id from the url
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

//request to delete using mongoose method findByIdAndDelete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

//require the review model

const Review = require('./models/review');

//add middleware for reviews

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


//request to post new reviews by id

app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


//request delete review

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


//catch all errors that werent handled by the asyncCatch with the ExpressError class

app.all("*", (req,res,next) => {
    next(new ExpressError("Page not found, 404"))
})
//error handler 

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render("error", { err })
})

//set port listening

app.listen(3000, () => {
    console.log('Serving on port 3000')
})