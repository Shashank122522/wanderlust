const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.redirect("/listings");
        }

        // Ensure req.body.review exists and is structured correctly
        if (!req.body.review) {
            return res.status(400).json({ error: "Invalid review data" });
        }

        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
       

        // Associate the review with the listing
        listing.reviews.push(newReview);
        

        // Save both the new review and the updated listing
        await newReview.save();
        await listing.save();
        req.flash("success" , "new Review created !");

        console.log("New review saved");
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.deleteReview = async (req, res, next) => {
    try {
        let { id, reviewId } = req.params;

        // Remove review reference from the listing
        let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Delete the actual review
        await Review.findByIdAndDelete(reviewId);
        req.flash("success" , " Review deleted !");

        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error deleting review:", error);
        next(error); // Pass the error to Express error handling middleware
    }
}