"use strict";

var request = require("request");
var Bing = require('node-bing-api')({ accKey: process.env.BING_API_KEY });
var mongo = require("mongodb").MongoClient;

module.exports = function(app){
    
    
    
    
    app.get("/", function(req, res){
        res.send("Search for images by querying the url /api?search={my image search query}[offset=10] or checkout the latest searches /latest");
    });
    
    
    
    
    
    
    app.get("/api", function(req, res){
        var querystring = req.query.search;
        var offset = req.query.offset || 10;
        
        console.log(querystring);
        
        mongo.connect("mongodb://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSWORD + "@ds133340.mlab.com:33340/queries", function(err, db){
            if (err) throw err;
            var collection = db.collection("queries");
            collection.insert({
                "query" : querystring,
                "when" : new Date()
            });
            db.close();
        });
    
        
        var theobj = [];
        
        
        Bing.images(querystring, {
          top: 10,
          offset: offset
          }, function(error, response, body){
              
                var imgs = body;
                var imgs_value = imgs.value;
                
                for(var obj in imgs_value){
                    theobj.push(imgs_value[obj]);
                }
                
                theobj = theobj.map(function(curr, i, arr){
                    return {
                        "url" : curr.webSearchUrl,
                        "thumbnail" : curr.thumbnailUrl,
                        "hostPageurl" : curr.hostPageDisplayUrl
                        };
                });
                
                res.json(theobj);
          });
        
        
    });
    
    
    
    
    
    
    
    app.get("/latest", function(req, res){
        var results;
        mongo.connect("mongodb://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSWORD + "@ds133340.mlab.com:33340/queries", function(err, db){
            if (err) throw err;
            var collection = db.collection("queries");
            results = collection.find({}, null, {
                "limit": 10, 
                "sort": [["when", -1]]
            }).toArray(function(err, items){
                if (err) throw err;
                res.json(items);
            });
            db.close();
        });
    });
}