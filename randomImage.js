var http = require('https');
var URL = require('url')

// Generate url to search Bing with
function generateSearchUrl(query) {
  return URL.format({
    protocol: 'https',
    auth: 'user:320e4Pia1S913at31CkWgi/tG+vWCdXSY8FltXbqqwY',
    host: 'api.datamarket.azure.com',
    pathname: '/Bing/Search/Image',
    query: {
      $format: 'json',
      Query: '\'' + query + '\'',
      ImageFilters: '\'Aspect:Wide\'',
      Adult: '\'Strict\''
    }
  });
}

// Respond with a random image
function respond(body, callback) {
  try {
    body = JSON.parse(body);
  } catch(e) {
    return callback(body);
  }
  var results = body && body.d && body.d.results;
  if (results) {
    var totalResults = results.length;
    var random = Math.floor(Math.random() * totalResults);
    var imageUrl = results[random].MediaUrl;

    return callback(null, imageUrl);
  } else {
    return callback('Could not find image');
  }
}

// Get images from bing
function randomImage(query, callback) {
  var searchUrl = generateSearchUrl(query);

  http.get(searchUrl, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      respond(body, callback);
    });
  });
}
module.exports = randomImage;
