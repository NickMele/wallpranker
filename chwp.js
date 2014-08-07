// requires
var util = require('util');
var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');

// global vars
var args = process.argv;
var platform = process.platform;
var imageUri = 'http://hdwallpapersdesktop.com/wallpapers/wp-content/uploads/2011/08/Star-Wars-Luke-Skywalker-Han-Solo-Harrison-Ford-Wallpaper.png';
var tmpFileName = (+new Date()).toString(36) + '.png';

// verbosity
var v = false;

// OS test
if (platform !== 'linux' && platform !== 'darwin') {
  throw 'OS not supported';
}

// initial function
function getImage() {
  v && console.log('Retrieving image...');
  http.get(imageUri, saveImage);
}

// http.get callback
function saveImage (res) {
  if (res.statusCode !== 200) {
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

// begin
getImage();