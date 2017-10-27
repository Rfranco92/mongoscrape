// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var methodOverride = require("method-override");


var PORT = process.env.PORT || 3000;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(logger("dev"));
app.use(express.static("public"));

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Send JSON responses
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Require all models
var db = require("./models");
var dataBaseURI = "mongodb://localhost/mongoHeadlines";

if (process.env.MONGODB_URI){
	mongoose.connect(process.env.MONGODB_URI)
}
else{
	mongoose.connect(dataBaseURI, {
  useMongoClient: true
});
}

var routes = require("./routes/routes.js");

app.use("/", routes);




app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
