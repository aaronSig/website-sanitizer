# Website Sanitizer

A utility NodeJS server that uses [PhantomJS](http://phantomjs.org/) and [Readability](https://github.com/mozilla/readability)
to sanitize the website provided.

## Configuration

The server can be configured by editing [node_module.js](https://github.com/superpixelhq/website-sanitizer/blob/master/node_module.js).

`phantomJSCommand`: Path to PhantomJS executable or simply phantomjs if added to the path

`processingScriptPath`: Path to the script used to process the file. Should be set to "parser.js"

`port`: Port on which the server should be running.
