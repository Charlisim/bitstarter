#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var url_HTML_content = null;
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = null;
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURL = function(URL){
    var url = URL.toString();
    var req = restler.get(url).on('complete', function(result){
	if (result instanceof Error){
	console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}else{
		console.log(result);
		url_HTML_content = result;
		console.log(url_HTML_content);
		console.log(URL);		
	}
	
     });
	return URL;

}

var loadHtmlURLContent = function(URL){
    if (url_HTML_content != null){
	console.log("NOT NULL");
	console.log(url_HTML_content);
    }else{
    var req = restler.get(URL).on('complete', function(result){
        if (result instanceof Error){
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }else{
		console.log(result);
		url_HTML_content = result;

        }
     });
     } 
     return url_HTML_content;
}
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checksURL = function(url, checksfile) {
   	console.log(loadHtmlURLContent(url));
	console.log('URL CONTENT');
    $ = loadHtmlURLContent(url);
    console.log($);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_address>', 'URL Address', clone(assertURL), URL_DEFAULT)
        .parse(process.argv);
    var checkJson = null;
if (program.url == false){

    checkJson = checkHtmlFile(program.file, program.checks);
}else{
	console.log(program.url)
       checkJson = checksURL(program.url, program.checks);
}

    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {

    exports.checkHtmlFile = checkHtmlFile;
}
