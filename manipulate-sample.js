/**
 * Created by dbagayau on 23/07/2016.
 */
'use strict';

var fs = require('fs');
var StreamZip = require('node-stream-zip');
var Zip = require('machinepack-zip');

var zipFile = 'sample-data.zip';
var extractFolder = 'xxx';
var sourceDir = extractFolder + '/sample-data';

// Unzip the specified .zip file and write the decompressed files/directories as contents of the specified destination directory.
Zip.unzip({
  source: zipFile,
  destination: extractFolder,
}).exec({
// An unexpected error occurred.
  error: function (err){

  },
// OK.
  success: function (){
    console.log("zip extracted");
    fs.readdir(sourceDir, function (err, files) {
      if (err) throw err;

      for (var i=0; i<files.length; i++) {
        var relativeFileName = sourceDir + '/' + files[i];
        if (endsWith(relativeFileName,'.json')) {
          console.log("updating " + relativeFileName);
          var data = JSON.parse(fs.readFileSync(relativeFileName, 'utf8'));
          data.docFormat = 'json';
          fs.writeFileSync(relativeFileName, JSON.stringify(data), 'utf8');
        }
      }
      console.log("done updating");

      // Compress the specified source files or directories into a .zip file.
      Zip.zip({
        sources: [ sourceDir ],
        destination: 'my-app.zip',
      }).exec({

        // An unexpected error occurred.
        error: function (err){

        },

        // OK.
        success: function (result){

        },
      });
    });
  },
});

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
