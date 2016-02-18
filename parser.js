var page   = require('webpage').create();
var system = require('system');
var args   = system.args;

function log(message) {
    // console.log(message);
}

function exitWithError(error) {
    console.error("ERROR: " + error);
    require("system").stderr.write(error);
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
    var location = document.location;

    var uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + "//" + location.host,
      scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
      pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
    };

    return new Readability(uri, document).parse();;
}

function load(address) {
    log("Loading web page: " + address);

    page.open(pageAddress, function(status) {
        log("Received status " + status);

        if(status === "success") {
            log("Injecting readability");

            if(!page.injectJs("Readability.js")) {
                exitWithError("Unable to inject the Readability library");
            }

            var result = page.evaluate(process);

            if(result === null || result === undefined || result.length == 0) {
                exitWithError("Readability was unable to process the article");
            }

            printArticle(result);
            phantom.exit(0);
            
        } else {
            exitWithError("Unable to load the site");
        }

        phantom.exit();
    }); 
}

load(pageAddress);