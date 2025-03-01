if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");





const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl =process.env.ATLASDB_URL;
main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb+srv://Shan12:Shaveebha12%40@cluster0.nruv6.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride('_method'));



const store = MongoStore.create({
    mongoUrl : 'mongodb+srv://Shan12:Shaveebha12%40@cluster0.nruv6.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0',
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000 ,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/", (req,res) => {
//     req.session.test = "Session Working!";
//     console.log("Session Data:", req.session);
//     res.send("Server is working well!");
// })
// app.use(session(sessionOptions));
// app.use(flash());

// app.get("/", (req,res) => {
//     req.session.test = "Session Working!";
//     console.log("Session Data:", req.session);
//     res.send("Server is working well!");
// })

// const validateListing = (req,res,next) => {
//     let {error} = listingSchema.validate(req.body);
//     if(error) {
//         let errMsg = error.details.map((el) => el.message.join(","));
//         throw new ExpressError(400, errMsg);

//     }else{
//         next();
//     }
// };

// const validateReview = (req,res,next) => {
//     let {error} = reviewSchema.validate(req.body);
//     if(error) {
//         let errMsg = error.details.map((el) => el.message.join(","));
//         throw new ExpressError(400, errMsg);

//     }else{
//         next();
//     }
// };

// app.get("/testListen", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         descreption: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// })
// // Index Route
// app.get("/listings", wrapAsync(async (req,res) => {
//    const allListings = await Listing.find({});
//    res.render("listings/index.ejs", {allListings});
    
// }))
// // New Route
// app.get("/listings/new", wrapAsync((req,res) => {
//     res.render("listings/new.ejs");
// }))
// // Show Route
// app.get("/listings/:id", wrapAsync(async (req,res) => {
//     let {id} = req.params;
//    const listing = await Listing.findById(id).populate("reviews");
//    res.render("listings/show.ejs", {listing});
// }))
// // Create Route
// app.post("/listings",validateListing, wrapAsync(async (req,res,next) => {
//     // let result = listingSchema.validate(req.body);
//     // console.log(result);
//     // if(result.error){
//     //     throw new ExpressError(400, result.error);
//     // }
//         const newListing = new Listing(req.body.listing);
//    await newListing.save();
//    res.redirect("/listings");
    

// })
// );
// // Edit Route
// app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", {listing});
// }))
// // Update Route
// app.put("/listings/:id", validateListing, wrapAsync(async (req,res) => {
//     let {id} = req.params;
//    await Listing.findByIdAndUpdate(id,{...req.body.listing});
//    res.redirect(`/listings/${id}`);
// }))
// // Delete Route
// app.delete("/listings/:id", wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }))
app.use((req, res, next) => {
    res.locals.currUser = req.user || null;  // ✅ Prevents undefined errors
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/", userRouter);

// // Reviews
// // Post Route





// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     try {
//         let listing = await Listing.findById(req.params.id);
//         if (!listing) {
//             return res.status(404).json({ error: "Listing not found" });
//         }

//         // Ensure req.body.review exists and is structured correctly
//         if (!req.body.review) {
//             return res.status(400).json({ error: "Invalid review data" });
//         }

//         let newReview = new Review(req.body.review);

//         // Associate the review with the listing
//         listing.reviews.push(newReview);
//         newReview.listing = listing._id;

//         // Save both the new review and the updated listing
//         await newReview.save();
//         await listing.save();

//         console.log("New review saved");
//         res.redirect(`/listings/${listing._id}`);
//     } catch (error) {
//         console.error("Error saving review:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }));

// // Delete Review Rourte

// app.delete("/listings/:id/reviews/:reviewId", async (req, res, next) => {
//     try {
//         let { id, reviewId } = req.params;

//         // Remove review reference from the listing
//         let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

//         if (!listing) {
//             return res.status(404).json({ error: "Listing not found" });
//         }

//         // Delete the actual review
//         await Review.findByIdAndDelete(reviewId);

//         res.redirect(`/listings/${id}`);
//     } catch (error) {
//         console.error("Error deleting review:", error);
//         next(error); // Pass the error to Express error handling middleware
//     }
// });


app.all("*", (req,res,next) => {
    next(new ExpressError(404,"Page not found!"));
})

app.use((err,req,res,next) => {
    let{statusCode = 500, message = "Something went wrong!"} = err;
    
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
})
app.listen(8080, () => {
    console.log("server is listening to port 8080");
})