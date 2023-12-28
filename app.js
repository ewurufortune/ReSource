//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const { Number } = require('mongoose');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// mongodb://localhost:27017/resourcesDB
// mongodb+srv://ewurufortune:pmX0GdJHQumI8jVb@resourcecluster.inplmwx.mongodb.net/resourceDB
// pmX0GdJHQumI8jVb
mongoose.connect("mongodb+srv://fortune:1234@resourcecluster.inplmwx.mongodb.net/resourceDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const roadmapSchema = new mongoose.Schema ({
  headline: String,
  tagline: String,
  number1: String,
  number1tag: String,
  number1link: String,
  number2: String,
  number2tag: String,
  number2link: String,
  number3: String,
  number3tag: String,
  number3link: String,
  number4: String,
  number4tag: String,
  number4link: String,
  number5: String,
  number5tag: String,
  number5link: String,
 

});
const RoadMap = new mongoose.model("RoadMap", roadmapSchema);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  category: String,
  storyRoadMap: [roadmapSchema]
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://serene-plateau-08594.herokuapp.com/auth/google/resources",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {


    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));





app.get("/", function(req, res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/resources",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to resources.
    res.redirect("/resources");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/mysources", function(req, res){

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log('foundUser')
        console.log(foundUser)
        console.log('Enduser')
        res.render("mysources", {user: foundUser,});
      
   
      }
    }
  });
});
app.get("/resources", function(req, res){



  User.find({"storyRoadMap": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {

      // console.log('FIRST USER'+foundUsers+'END USER')
      if (foundUsers) {
        const vote=[]
        for (let i = 0; i < foundUsers.length; i++) {
          const voteR=Math.floor(Math.random()*1000)
         foundUsers.forEach(user => {
          if (user.storyRoadMap.length!==0){
      
            const voteR=Math.floor(Math.random()*1000)
            vote.push(voteR)

     
          }else{

          }
         
        
      
         });
   
        }
        console.log (vote)
      
        res.render("resources", {usersWithResources: foundUsers,vote:vote});
      }
    }
  });
});




app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res){
 
  const headline = req.body.headline;
    const tagline = req.body.tagline;
      const number1 = req.body.number1;
      const number1tag = req.body.number1tag;
      const number1link = req.body.number1link;
      const number2 = req.body.number2;
      const number2tag = req.body.number2tag;
      const number2link = req.body.number2link;
      const number3 = req.body.number3;
      const number3tag = req.body.number3tag;
      const number3link = req.body.number3link;
      const number4 = req.body.number4;
      const number4tag = req.body.number4tag;
      const number4link = req.body.number4link;
      const number5 = req.body.number5;
      const number5tag = req.body.number5tag;
      const number5link = req.body.number5link;
    
//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
    const latestResource = new RoadMap({
      headline: headline,
  tagline: tagline,
  number1: number1,
  number1tag: number1tag,
  number1link: number1link,
  number2: number2,
  number2tag: number2tag,
  number2link: number2link,
  number3: number3,
  number3tag: number3tag,
  number3link: number3link,
  number4: number4,
  number4tag: number4tag,
  number4link: number4link,
  number5: number5,
  number5tag: number5tag,
  number5link: number5link,
    })

        foundUser.storyRoadMap.push( latestResource);

        foundUser.save(function(){

          res.redirect("/resources");
        });
   
      }
    }
  });
  });

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
     
      passport.authenticate("local")(req, res, function(){
     
        res.redirect("/resources");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/resources");
      });
    }
  });

});







app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});