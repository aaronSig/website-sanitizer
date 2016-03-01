var childProcess = require('child_process');
var express = require('express');
var swig  = require('swig');
var NodeCache = require( "node-cache" );

// -------------------------------------------------- CONFIG

var phantomJSCommand = "phantomjs";
var processingScriptPath = "parser.js";
var port = 8899;
var cacheTTL = 3600000;

// -------------------------------------------------- LOGGING

var Severity = {
    VERBOSE : 0,
    DEBUG   : 1,
    ERROR   : 2
}

var logMinSeverity = Severity.DEBUG;

if(process.argv.length > 2) {
    logMinSeverity = process.argv[2];
}

function log(severity, value) {
    if(severity < logMinSeverity) {
        return;
    }

    message = Date.now() + " ";

    switch(severity) {
        case Severity.VERBOSE:
            message = message + "[V]";
            break;

        case Severity.DEBUG:
            message = message +  "[D]";
            break;

        case Severity.ERROR:
            message = message + "[E]";
            break;

    }

    console.log(message + " " + value);
}

// -------------------------------------------------- PROCESSING

function getPhantomCommand(url) {
    command = [phantomJSCommand, processingScriptPath, url].join(" ");
    log(Severity.VERBOSE, command);

    return command;
}

/**
 * Passes the provided url to phantomjs with a parser function attached.
 * Returns an Article object or HTTP status code 500
 *
 * Article object:
 *
 * {
 *    "byline" : [byline],
 *    "content" : [sanitized content HTML],
 *    "dir" : [dir], // not in use
 *    "exceprt" : [article excerpt],
 *    "length" : [article length],
 *    "title" : [title],
 *    "uri" : {
 *       "host": [host],
 *       "pathBase": [path base],
 *       "prePath": [prePath],
 *       "scheme": [scheme],
 *       "spec": [spec]
 *    }
 * }
 */
function _process(url, res) {
    childProcess.exec(
        getPhantomCommand(url),
        function(err, stdout, stderr) {
            // handle results 
            if(stderr === null || stderr == undefined || stderr.length == 0) {
                processedJson = JSON.parse(stdout);

                log(Severity.DEBUG, "Processing complete");
                log(Severity.VERBOSE, JSON.stringify(processedJson));

                res.send(processedJson);
            } else if(stderr != null) {
                log(Severity.ERROR, "stderr");
                log(Severity.ERROR, stderr);
                res.send(500, err);
            } else if(err != null) {
                log(Severity.ERROR, "err");
                log(Severity.ERROR, err);
                res.send(500, err);
            }
        }
    );  

}

function _sanitize(url, res) {
    if(cache.get(url) != undefined) {
        log(Severity.DEBUG, "Loading from cache");
        res.send(_wrap(cache.get(url)));
    } else {
        childProcess.exec(
            getPhantomCommand(url),
            function(err, stdout, stderr) {
                // handle results 
                if(stderr === null || stderr == undefined || stderr.length == 0) {
                    processedJson = JSON.parse(stdout);

                    cache.set(url, processedJson);

                    log(Severity.DEBUG, "Processing complete");
                    log(Severity.VERBOSE, JSON.stringify(processedJson));

                    res.send(_wrap(processedJson));
                } else if(stderr != null) {
                    log(Severity.ERROR, "stderr");
                    log(Severity.ERROR, stderr);
                    res.send(500, err);
                } else if(err != null) {
                    log(Severity.ERROR, "err");
                    log(Severity.ERROR, err);
                    res.send(500, err);
                }
            }
        );     
    }
    
};

function _wrap(article) {
    var dat = article.uri.spec.match(/(\d{4})(?:\/(\d{2}))?(?:\/(\d{2}))/);

    log(Severity.VERBOSE, dat);

    return swig.renderFile("templates/mothercare.html", {content: article, date: dat});
}

// -------------------------------------------------- SERVER

/**
 * Starts the server and listens on the port provided
 */
function startServer(port) {
    log(Severity.DEBUG, "Starting server on port " + port);

    var app = express();
    app.use(express.static("public"));

    app.get("/process/:url", function(req, res) {
        log(Severity.DEBUG, "Processing: " + req.params.url);
        _process(req.params.url, res);
    }); 

    app.get("/wrap/:url", function(req, res){
        log(Severity.DEBUG, "Wrapping " + req.params.url);
        _sanitize(req.params.url, res);
    });

    app.listen(port);

    log(Severity.DEBUG, "Server started");
}   

// -------------------------------------------------- MAIN

cache = new NodeCache({ stdTTL: cacheTTL, checkperiod: 60000 });
swig.setDefaults({ cache: false });

startServer(port);


