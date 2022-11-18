//requiere mongoose
const mongoose = require('mongoose');

//create variable shortcut to mongoose.Scheema
const Schema = mongoose.Schema;

//require the reviews scheema
const Review = require('./review')

//create CampgroundSchema

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});
//delete the reviews inside a deleted campground

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//export scheema CampgroundSchema named "Campground"

module.exports = mongoose.model('Campground', CampgroundSchema);