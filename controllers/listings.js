 const Listing = require("../models/listing");
 
 module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
     
 };

 module.exports.renderNewForm = (req,res) => {
   
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author",},}).populate("owner");

    if (!listing || !listing.owner) {
        req.flash("error", "Listing you requested for does not exist or has no owner");
        return res.redirect("/listings");
    }

    console.log(listing);  // ✅ Debugging
    res.render("listings/show.ejs", { listing });
};


// module.exports.createListing = async (req,res,next) => {
//     // let result = listingSchema.validate(req.body);
//     // console.log(result);
//     // if(result.error){
//     //     throw new ExpressError(400, result.error);
//     // }
//     let url = req.file.path;
//     let filename = req.file.filename;
//     console.log(url,"..",filename);
// //         const newListing = new Listing(req.body.listing);
// //         newListing.owner = req.user._id;
// //    await newListing.save();
//    req.flash("success" , "new Listing created !");
//    res.redirect("/listings");
    

// };

module.exports.createListing = async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "Please upload an image.");
            return res.redirect("/listings/new"); // ✅ Prevents sending multiple responses
        }

        let url = req.file.path;
        let filename = req.file.filename;
        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename }; // Assuming image field exists in Listing schema
        
        await newListing.save();
        
        req.flash("success", "New listing created!");
        return res.redirect("/listings"); // ✅ Always return after sending response
    } catch (err) {
        next(err); // ✅ Pass error to Express error handler
    }
};

module.exports.editListing = async (req,res) => {
     let {id} = req.params;
     const listing = await Listing.findById(id);
     if(!listing) {
        req.flash("error", "listing does not exist");
        return res.redirect("/listings");
     }
     let originalImageUrl = listing.image.url;
     originalImageUrl =  originalImageUrl.replace("/upload", "/upload/h_300,w_250");
     res.render("listings/edit.ejs", {listing , originalImageUrl});
 };

 module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
   let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
   if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
   }

   req.flash("success" , " Listing updated !");
   res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
}