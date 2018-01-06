const express = require('express');    //Express Web Server
const path = require('path');     //used for file path
const fs = require('fs-extra');       //File System - for file manipulation
const uuid = require('uuid/v4');
const exec = require('child_process').exec;
const Busboy = require('busboy');
const PORT = process.env.port || 9022;

var app = express();

/* ==========================================================
 Create a Route (/) to serve instructions homepage
 ============================================================ */
app.get('/', function (req, res) {
  let home = __dirname+"/home.html";
  let stat = fs.statSync(home);
  var readStream = fs.createReadStream(home);
  var html = "";
  readStream.on('data', function (chunk) {
        html += chunk.toString().replace("@PORT", PORT);
  });
  readStream.on('end', function(){
    res.status(200).send(html);
  });

});

/* ==========================================================
 Create a Route (/convert) to handle the upload of rtf
 (handle POST requests to /upload)
 Express v4  Route definition
 ============================================================ */
app.route('/convert')
        .post(function (req, res, next) {
            var busboy = new Busboy({headers: req.headers});
            var fstream;
            var rtf = '';

            let tempdir = '/tmp/' + uuid()
            fs.mkdir(tempdir);
            let filesUploaded = 0;
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

                let rtf_path = tempdir + '/data.rtf';
                fstream = fs.createWriteStream(rtf_path);
                file.pipe(fstream);

                fstream.on('close', function () {
                    filesUploaded++;
                    console.log('Uploaded File: ' + filename);

                    if (fieldname == "rtf") {

                        let cmd = "/usr/bin/libreoffice --headless --invisible --norestore  --convert-to html --outdir " + tempdir + " " + rtf_path;
                        console.log('Running Command: ' + cmd);
                        res.setHeader('Cmd', cmd);

                        exec(cmd, function (error, stdout, stderr) {
                            if (stdout) {
                                console.log("Conversion OUTPUT: " + stdout);
                            }

                            if (stdout) {
                                console.log("Conversion ERROR: " + stderr);
                            }

                            if (error) {
                                console.error("Error Converting RTF");
                                res.status(500);
                                res.send('Could not convert RTF File');
                            } else {
                                let html_path = tempdir + '/data.html';
                                let stat = fs.statSync(html_path);
                                console.error("File Saved and Streaming: " + html_path);
                                res.writeHead(200, {
                                    'Content-Type': 'text/html',
                                    'Content-Length': stat.size
                                });

                                var readStream = fs.createReadStream(html_path);
                                readStream.pipe(res);
                                exec('rm -rf ' + tempdir, function (err, stdout, stderr) {
                                    if (err) {
                                        console.error("Could not delete " + rtf_path);
                                    } else {
                                        console.log("Deleted " + rtf_path);
                                    }
                                });
                            }
                        });
                    }
                });
            });
            req.pipe(busboy);
        });

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
