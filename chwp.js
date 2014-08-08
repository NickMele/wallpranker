// requires
var util = require('util');
var exec = require('child_process').exec;
var http = require('http');
var https = require('https');
var fs = require('fs');
var URL = require('url');

// global vars
var args = process.argv;
var platform = process.platform;
var defaultImageUri = 'http://hdwallpapersdesktop.com/wallpapers/wp-content/uploads/2011/08/Star-Wars-Luke-Skywalker-Han-Solo-Harrison-Ford-Wallpaper.png';
var tmpFileName = (+new Date()).toString(36) + '.png';
var totalAttempts = 0;
var maxAttempts = 3;
// verbosity
var v = false;

// OS test
if (platform !== 'linux' && platform !== 'darwin') {
  throw 'OS not supported';
}

// initial function
function getImage() {
  v && console.log('Retrieving image...');
  var query = args[2] || 'hasselhoff';
  if (totalAttempts < maxAttempts) {
    randomImage(query, function(error, imageUri) {
      if (error) {
        return http.get(defaultImageUri, saveImage);
      }
      return http.get(imageUri, saveImage);
    });
  } else {
    return http.get(defaultImageUri, saveImage);
  }
  totalAttempts++;
}

// http.get callback
function saveImage (res) {
  if (res.statusCode !== 200) {
    if (totalAttempts < maxAttempts) {
      getImage();
    }
    throw 'Image response: ' + res.statusCode;
  }

  v && console.log('Image retrieved.');

  var image = '';

  res.setEncoding('binary');
  res.on('data', function (chunk) {
    image += chunk;
  });

  res.on('end', function () {
    v && console.log('Saving image...');
    fs.writeFile(tmpFileName, image, 'binary', getCurrDir);
  });
}

// fs.writeFile callback
function getCurrDir (err) {
  if (err) {
    throw err;
  }

  v && console.log('Image saved.');

  exec('pwd', setWallpaper);
}

// exec pwd callback
function setWallpaper (error, stdout, stderr) {
  if (error) {
    throw error;
  } else if (stderr) {
    throw stderr;
  }

  var setWpCmd;
  var directory = stdout.slice(0, -1);

  if (platform === 'linux') {
    setWpCmd = buildLinuxCmd(directory);
  } else if (platform === 'darwin') {
    setWpCmd = buildOsxCmd(directory);
  }

  v && console.log('Setting wallpaper...');
  exec(setWpCmd, cleanUp);
}

// make linux command to execute
function buildLinuxCmd (dir) {
  var setter = 'gsettings set org.gnome.desktop.background picture-uri';
  var file = 'file://' + dir + '/' + tmpFileName;

  return setter + ' ' + file;
}

// make osx command to execute
function buildOsxCmd (dir) {
  var file = dir + '/' + tmpFileName;
  var setter = 'osascript'
           + ' -e \'tell Application "System Events"\''
           + ' -e \'set theDesktops to a reference to every desktop\''
           + ' -e \'repeat with theItem in theDesktops\''
           + ' -e \'  set the picture of theItem to POSIX file "' + file + '" as alias\''
           + ' -e \'end repeat\''
           + ' -e \'end tell\'';

  return setter;
}

// exec setWallpaper callback
function cleanUp (error, stdout, stderr) {
  if (error) {
    throw error;
  } else if (stderr) {
    throw stderr;
  }

  v && console.log('Wallpaper set.');
  setTimeout(removeImage, 2000);
}

// fs.unlink closure
function removeImage () {
  v && console.log('Removing image...');
  return fs.unlink(tmpFileName, function (error) {
    if (error) {
      throw error;
    }

    v && console.log('Image deleted.');

    console.log('Lock your computer next time!');
  });
}

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
  if (results.length) {
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

  https.get(searchUrl, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      respond(body, callback);
    });
  });
}

// begin
getImage();
