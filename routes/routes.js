var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var db = require("../models");


var app = express.Router();

app.get("/", function(req, res) {
  res.render("index");
});

// A GET route for scraping the echojs website
app.get("/api/fetch", function(req, res) {
  // First, we grab the body of the html with request

  request("http://www.nytimes.com", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var result = {};

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works

   $("article.theme-summary").each(function(i, element) {
      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .children(".story-heading")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children(".summary")
        .text();
    // Save these results in an object that we'll push into the results array we defined earlier
    // Create a new Article using the `result` object built from scraping
      for (var i = 0; i < db.Article.length; i++){
      if (result.headline && result.link && result.summary){

      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      }
     } 
     res.json()
    });
  });
});

// Route for getting all Articles from the db
app.get("/api/headlines", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/notes/:id", function(req, res) {

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/api/notes", function(req, res) {

  db.Note.drop_id()

  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      console.log(dbNote);
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.body._id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {

      console.log(err);
      // If an error occurred, send it to the client
      res.json(err);
    });
});




module.exports = app;