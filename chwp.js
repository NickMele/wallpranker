var util = require('util');
var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');


var args = process.argv;
var platform = process.platform;

var setCmd = '';


var solo = 'http://hdwallpapersdesktop.com/wallpapers/wp-content/uploads/2011/08/Star-Wars-Luke-Skywalker-Han-Solo-Harrison-Ford-Wallpaper.png';

var tmpFileName = (+new Date()).toString(36) + '.png';

var linuxSet = 'gsettings set org.gnome.desktop.background picture-uri';



if (platform === 'linux') {
  setCmd = linuxSet;
} else if (platform === 'darwin') {
  //setCmd = osxSet;
} else {
  throw 'Not supported.';
}


// request image
http.get(solo, function (res) {
  if (res.statusCode !== 200) {
    throw 'Image responded with ' + res.statusCode;
  } else {
    console.log('Image response: ' + res.statusCode);
  }

  var image = '';

  res.setEncoding('binary');
  res.on('data', function (chunk) {
    image += chunk;
  });

  res.on('end', function () {
    fs.writeFile(tmpFileName, image, 'binary', function (err) {
      if (err) {
        throw err;
      }

      console.log('Image saved.');

      exec('pwd', function (error, stdout, stderr) {
        if (error) {
          console.error('exec error: ' + error);
        }
        console.log('stdout: ' + stdout);
        console.error('stderr: ' + stderr);

        var setWpCmd

        if (platform === 'linux') {
          setWpCmd = setLinux + ' file://' + stdout.slice(0, -1) + '/' + tmpFileName;
        } else if (platform === 'darwin') {
          setWpCmd = 'osascript -e \'tell Application "Finder"\''
           + ' -e \'tell Application "System Events"\''
           + ' -e \'set theDesktops to a reference to every desktop\''
           + ' -e \'set the picture of item 2 of theDesktops to POSIX file "' + stdout.slice(0, -1) + '/' + tmpFileName + '" as alias\''
           + ' -e \'end tell\''
           + ' -e \'set desktop picture to POSIX file "' + stdout.slice(0, -1) + '/' + tmpFileName + '" as alias\''
           + ' -e \'end tell\'';
        } else {
          setWpCmd = 'echo foo';
        }

        exec(setWpCmd, function (error, stdout, stderr) {
          if (error) {
            console.error('exec error: ' + error);
          }
          console.log('stdout: ' + stdout);
          console.error('stderr: ' + stderr);

          console.log('Wallpaper set.');

          function rm () {
            return fs.unlink(tmpFileName, function (error) {
              if (error) {
                throw error;
              }

              console.log('Image deleted.');
            });
          }

          // leave enough time to set wp before deleting
          setTimeout(rm, 2000);
        })
      })
    })




  })


})
