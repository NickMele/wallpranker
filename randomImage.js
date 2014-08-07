var util = require('util');
var http = require('https');
var URL = require('url')

var args = process.argv;


function randomImageUrl(query, callback) {
  var searchUrl = URL.format({
    protocol: 'https',
    auth: 'user:320e4Pia1S913at31CkWgi/tG+vWCdXSY8FltXbqqwY',
    host: 'api.datamarket.azure.com',
    pathname: '/Bing/Search/Image',
    query: {
      $format: 'json',
      Query: '\'' + query + '\'',
      ImageFilters: '\'Size:Width:1440+Size:Height:900\''
    }
  });


  http.get(searchUrl, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return callback(e);
      }
      var results = body && body.d && body.d.results;
      if (results) {
        var totalResults = results.length;
        var random = Math.floor(Math.random() * (totalResults - 1));
        var imageUrl = results[random];
        return callback(null, imageUrl);
      } else {
        return callback('Could not find image');
      }
    });
  });
}

module.exports = randomImageUrl;
