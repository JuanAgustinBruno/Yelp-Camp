//requiere mongoose
const mongoose = require('mongoose');

//create variable shortcut to mongoose.Scheema
const Schema = mongoose.Schema;


//create CampgroundSchema

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});


//export scheema CampgroundSchema named "Campground"

module.exports = mongoose.model('Campground', CampgroundSchema);