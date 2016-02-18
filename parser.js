var page   = require('webpage').create();
var system = require('system');
var args   = system.args;

function _log(message) {
    console.log(message);
}

function exitWithError(error) {
    console.error("ERROR: " + error);
    require("system").stderr.write(Array.prototype.join.call(arguments, ' '));
    phantom.exit(10);
}

if(args.length == 1) {
    exitWithError("No url provided");
}

var pageAddress = system.args[1];

function printArticle(article) {
    console.log(JSON.stringify(article));
}

function storeArticle(url, article) {
    var fs = require('fs');
    fs.write("result.html", article.content, "w");
}

function process() {
    // _log("processing web page");

    var location = document.location;

    // _log("location: " + location);

    var uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + "//" + location.host,
      scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
      pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
    };

    // _log("uri");
    // _log(JSON.stringify(uri));

    var article = new Readability(uri, document).parse();

    if(article === null || article === undefined || article.length == 0) {
        exitWithError("Readability was unable to process the article");
    }


    // _log("article");
    // _log(JSON.stringify(article));   

    // _log("processing complete");

    return article;
}

function load(address) {
    // _log("loading web page: " + address);

    page.open(pageAddress, function(status) {
        // _log("received status " + status);

        if(status === "success") {
            // _log("injecting readability");

            if(!page.injectJs("Readability.js")) {
                // _log("COULDNT LOAD READABILITY");
                exitWithError("Unable to inject the Readability library");
            }

            var result = page.evaluate(process);

            printArticle(result);
            phantom.exit(0);
            
        } else {
            exitWithError("Unable to load the site");
        }

        phantom.exit();
    }); 
}

load(pageAddress);