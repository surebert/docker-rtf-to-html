const express = require('express');    //Express Web Server
const path = require('path');     //used for file path
const fs = require('fs-extra');       //File System - for file manipulation
const uuid = require('uuid/v4');
const exec = require('child_process').exec;
const Busboy = require('busboy');
const PORT = process.env.port || 9022;

var app = express();

function cleanTmp(tempdir) {
    //delete temp directory if it exists

    try{
        if (fs.existsSync(tempdir)) {
            exec('rm -rf ' + tempdir, function (err, stdout, stderr) {
                if (err) {
                    console.error("Could not delete files from " + tempdir);
                } else {
                    console.log("Deleted files from " + tempdir);
                }
            });
        }
    } catch(ex){
        
    }
    
}
     
function serveError(res, message){
    
   message = message || 'Could not convert RTF File';
   console.error(message);
   console.log("Sending 500 response");
   res.status(500);
   res.send(message);
   cleanTmp(tempdir);

}
/* ==========================================================
 Create a Route (/) to serve instructions homepage
 ============================================================ */
app.get('/', function (req, res) {
    let home = __dirname + "/home.html";
    let stat = fs.statSync(home);
    var readStream = fs.createReadStream(home);
    var html = "";
    readStream.on('data', function (chunk) {
        html += chunk.toString().replace("@PORT", PORT);
    });
    readStream.on('end', function () {
        res.status(200).send(html);
    });

});


/* ==========================================================
 Create a Route (/convert) to handle the upload of rtf
 (handle POST requests to /upload)
 Express v4  Route definition
 ============================================================ */
app.route('/convert').post(function (req, res, next) {
    var busboy = new Busboy({headers: req.headers});
    var tempdir = '/tmp/' + uuid();
    var rtf_path = tempdir + '/data.rtf';
    var html_path = tempdir + '/data.html';
    var fstream;
    
    console.log("Going to create directory "+tempdir);
    fs.mkdir(tempdir,function(err){
       if (err) {
           return console.error(err);
       }
       console.log("Directory "+tempdir+" created successfully!");
    });
    
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

        if (fieldname != "rtf") {
            return serveError(res, "You must upload a file with form fieldname rtf");
        }

        fstream = fs.createWriteStream(rtf_path);
        file.pipe(fstream);

        fstream.on('close', function () {

            let cmd = "/usr/bin/libreoffice --headless --invisible --norestore  --convert-to html --outdir " + tempdir + " " + rtf_path;
            console.log('Running Command: ' + cmd);
            res.setHeader('Cmd', cmd);
            
            exec(cmd, function (error, stdout, stderr) {
                if (stdout) {
                    console.log("Conversion OUTPUT: " + stdout);
                }

                if (stderr) {
                    console.log("Conversion ERROR: " + stderr+". This can occur if RTF file is invalid.");
                    return serveError(res, stderr);
                }

                if (fs.existsSync(tempdir)) {
                    let stat = fs.statSync(html_path);
                    if(stat){
                        console.log("File Saved, beginning to stream streaming: " + html_path);
                        res.writeHead(200, {
                            'Content-Type': 'text/html',
                            'Content-Length': stat.size
                        });

                        let readStream = fs.createReadStream(html_path);
                        readStream.pipe(res);

                        cleanTmp(tempdir);
                        return;
                    } 
                }
                
                serveError(res, "Error Serving RTF File");

            });
        });

    });


    req.pipe(busboy);
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
