const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const {isLoggedIn , isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});

// const validateListing = (req,res,next) => {
//     let {error} = listingSchema.validate(req.body);
//     if(error) {
//         let errMsg = error.details.map((el) => el.message.join(","));
//         throw new ExpressError(400, errMsg);

//     }else{
//         next();
//     }
// };
router.route("/")
.get( wrapAsync (listingController.index))
.post( isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing)
 );

  // New Route
  router.get("/new",isLoggedIn, wrapAsync(listingController.renderNewForm));

 router.route("/:id")
 .get( wrapAsync(listingController.showListing))
 .put( isLoggedIn,isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
 .delete( isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Index Route
// router.get("/", wrapAsync (listingController.index));

 // Show Route
//  router.get("/:id", wrapAsync(async (req,res) => {
//      let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews").populate("owner");
//     if(!listing) {
//         req.flash("error" , " listing you requested for does not exist");
//         res.redirect("/listings");
//     }
//     console.log(listing);
//     res.render("listings/show.ejs", {listing});
//  }))

// router.get("/:id", wrapAsync(listingController.showListing));
 // Create Route
//  router.post("/", isLoggedIn,validateListing, wrapAsync(listingController.createListing)
//  );
 // Edit Route
 router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing))
 // Update Route
//  router.put("/:id", isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing))
 // Delete Route
//  router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


 module.exports = router;