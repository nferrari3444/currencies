const express = require("express");
const request = require("request")
const bodyParser = require("body-parser");

require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const  flash  = require('connect-flash');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const TwitterStrategy = require("passport-twitter");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const findOrCreate = require('mongoose-findorcreate')


//const https = require("https");
//const { Http2ServerRequest } = require("http2");


const app = express();

app.use(bodyParser.urlencoded({extended:true}));

// para servir static images en el servidor
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}))



app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
mongoose.connect("mongodb+srv://admin-nicolas:baltazar2020@currencycluster.1y7ya.mongodb.net/currencyUsers", {useNewUrlParser: true});
//mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  facebookId: String,
  twitterId: String,
  secret: String
});

const userSchemaLocal = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

userSchemaLocal.plugin(passportLocalMongoose)
userSchemaLocal.plugin(findOrCreate)

const currUser = new mongoose.model("currencyUser", userSchemaLocal);

const socialUser = new mongoose.model("socialUser", userSchema)

passport.use(currUser.createStrategy());

// passport.serializeUser(function(currUser,done){
//   done(null, currUser.id)
// });

// passport.deserializeUser(function(id, done){
//   currUser.findById(id, function(err, currUser){
//     done(err,currUser)
//   })
// });

// passport.serializeUser( (user, done) => {
//   var sessionUser = { _id: user._id, name: user.name, email: user.email, roles: user.roles }
//   done(null, sessionUser)
// })

// serialize the user.id to save in the cookie session, so the browser will remember
// the user when login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(function(id,done) {
  currUser.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:3002/auth/twitter/currency-exchange",
//  passReqToCallback: true
},
function(token, tokenSecret, profile, done) {
  console.log('twitter profile')
  console.log(profile)
  socialUser.findOrCreate({twitterId: profile.id} , function(err,user){
    return done(err,user);
  })
}

));

passport.use(new GoogleStrategy({
  clientID:     process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3002/auth/google/currency-exchange",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
  console.log(profile)
  currUser.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(err, user);
  });
}
));

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key

app.get("/", function(req,res){
 req.flash('message','welcome')
  res.sendFile(__dirname + "/login.html")   
  
    console.log("estamos aca gente")
})
    
app.get("/currency-data", function(req,res) {
  res.sendFile(__dirname + "/initialPage.html")
}); 
    


app.get("/auth/google" , 
  passport.authenticate("google", {scope: ["profile"]} )
)

app.get("/auth/google/currency-exchange", 
passport.authenticate('google', {failureRedirect: '/login' }),
function(req, res) {
  //Successful authentication, redirect home.
   res.redirect("/currency-data")  
}
)

app.get('/auth/twitter', 
passport.authenticate('twitter'));

app.get('/auth/twitter/currency-exchange', 
passport.authenticate('twitter', {failureRedirect: '/login'}),
function(req,res){
  //Successful authentication, redirect home.
  res.redirect('/currency-data')
}
)



app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/register", function(req, res) {
  res.sendFile(__dirname + "/register.html")
})

app.post("/register", function(req,res) {
  currUser.register({username: req.body.username},  req.body.password,
     function(err,user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      console.log(req)
      passport.authenticate("local")(req,res, function(){
        res.redirect("/currency-data")
      })
    }
  })
})

app.post("/login", passport.authenticate("local", {failureRedirect:"/", 
failureFlash: "Invalid username or password"}),

function(req, res) {
console.log(req.user)

       res.redirect("/currency-data");
        }
)
  

//app.post()
// app.get('/currency/:curr', function(req, res, next) {
//   var topicname = req.params.curr;
//   res.send("hola hola")
// })


    
//  app.post("/", function (req,res) {

//         console.log("Post request received");
//         const currencyExchange = req.body.currency
//         const currencyExchange_ = req.body
        
//         console.log("currency is")
//         console.log(currencyExchange)

//         var typeOfVar = Object.prototype.toString.call(currencyExchange);
//         console.log(typeOfVar)
      
//         var baseCurr= 'USD'
//         var quoteCurr = currencyExchange.slice(4,7)
//         console.log(baseCurr)
//         console.log(quoteCurr)

//         var url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=" + baseCurr + "&to_currency=" + quoteCurr + "&apikey=RQKFECZIU89JZK5T";
//         // res.redirect("/currency/" + currencyExchange)
//         console.log(url)

// request.get({
//     url: url,
//     json: true,
//     headers: {'User-Agent': 'request'}
//   }, (err, res, data) => {
//     if (err) {
//       console.log('Error:', err);
//     } else if (res.statusCode !== 200) {
//       console.log('Status:', res.statusCode);
//     } else {
//       // data is successfully parsed as a JSON object:
//       console.log('data is:')
//       console.log(data)
//       const info = data[Object.keys(data)[0]]
//       console.log(info)
//       const baseCurr = info['1. From_Currency Code']
//       const quoteCurr = info['3. To_Currency Code']

//       console.log("Exchange Rate for Currency Pair" + " "+ baseCurr + " "+  "To" + " " +
//        quoteCurr + " " + "is" + " ") 

//       var rate = info['5. Exchange Rate']
      
//       console.log(info['5. Exchange Rate'])
//       console.log(Array.from(info))
//       console.log(data);
//     }
//     const info = data[Object.keys(data)[0]]
//     var rate = info['5. Exchange Rate']
 
// });
// });




app.listen(process.env.PORT || 3002, function() {
    console.log("Server is running on port 3002")
});