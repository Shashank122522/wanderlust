const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{ type: String,
        required: true,
    } ,
    description: String,
    // image: { type: String,
        
            
    //     default: "https://www.google.com/search/about-this-image?img=H4sIAAAAAAAA_-MS5djTdX7ugQcNMzkF1r5deHFN05MdLxkB2YtxzhcAAAA%3D&q=https:%2F%2Funsplash.com%2Fs%2Fphotos%2Funsplash-app&cs=1&ctx=iv&hl=en-IN&sa=X&ved=0CA0Qg4ILahcKEwi4lOWD6cKKAxUAAAAAHQAAAAAQBA",
    //     set: (v) => v === "" ? "https://www.google.com/search/about-this-image?img=H4sIAAAAAAAA_-MS5djTdX7ugQcNMzkF1r5deHFN05MdLxkB2YtxzhcAAAA%3D&q=https:%2F%2Funsplash.com%2Fs%2Fphotos%2Funsplash-app&cs=1&ctx=iv&hl=en-IN&sa=X&ved=0CA0Qg4ILahcKEwi4lOWD6cKKAxUAAAAAHQAAAAAQBA" : v ,

    // },

    image: {
        filename: { type: String },
        url: { type: String  },
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }

   
});


listingSchema.post("findOneAndDelete" , async (listing) =>{

    if(listing) {
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
    
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;