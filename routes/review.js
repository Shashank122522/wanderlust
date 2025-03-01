const express = require("express");
const router = express.Router({ mergeParams : true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const {isLoggedIn , isReviewAuthor} = require("../middleware.js");



const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message.join(","));
        throw new ExpressError(400, errMsg);

    }else{
        next();
    }
};
const reviewController = require("../controllers/reviews.js");

// Reviews
// Post Route





router.post("/:id/reviews",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Rourte

router.delete("/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));


module.exports = router;