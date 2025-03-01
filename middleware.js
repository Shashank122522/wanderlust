const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema , reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressErrors.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        // redirected url save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create a listing");
        res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
     if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
         }
         next();
}


// module.exports.isOwner = async(req,res,next) => {
//     let {id} = req.params;
//     let listing = await Listing.findById(id);
//     if(!listing.owner._id.equals(res.locals.currUser._id)){
//        req.flash("error", "you are not the owner of this listing");
//       return  res.redirect(`/listings/${id}`);
//     }
//      next();
// };

// module.exports.isOwner = async (req, res, next) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id).populate("owner");  // ✅ Populate owner

//     if (!listing) {
//         req.flash("error", "Listing not found!");
//         return res.redirect("/listings");
//     }

//     if (!listing.owner || !listing.owner._id) {  // ✅ Prevents undefined errors
//         req.flash("error", "This listing has no owner.");
//         return res.redirect("/listings");
//     }

//     if (!res.locals.currUser || !res.locals.currUser._id) {  // ✅ Prevents undefined user errors
//         req.flash("error", "You must be logged in.");
//         return res.redirect("/login");
//     }

//     if (!listing.owner._id.equals(res.locals.currUser._id)) {
//         req.flash("error", "You are not the owner of this listing.");
//         return res.redirect(`/listings/${id}`);
//     }

//     next();
// };

module.exports.isOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings"); // ✅ Prevents multiple responses
        }

        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/listings/${id}`); // ✅ Ensures only one redirect
        }

        next(); // ✅ Only call next() if there are no redirects
    } catch (err) {
        next(err); // ✅ Pass errors to Express error handler
    }
};


module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message.join(","));
        throw new ExpressError(400, errMsg);

    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId).populate("author");  // ✅ Corrected field name

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author || !review.author._id) {  // ✅ Prevent undefined errors
        req.flash("error", "This review has no author.");
        return res.redirect(`/listings/${id}`);
    }

    if (!res.locals.currUser || !res.locals.currUser._id) {  // ✅ Ensure user is logged in
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    if (!review.author._id.equals(res.locals.currUser._id)) {  // ✅ Compare IDs correctly
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};