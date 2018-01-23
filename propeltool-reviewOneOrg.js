/**
 * Created by pengl on 6/30/2017.
 */

const extractData = require('./src/extractPropelAccounts.js');
const application = require('./src/child_process_Adapter');
const clearLogs = require('./src/clearLogs');
const program = require('commander');
const path = require('path');
const fs = require('fs');

function generateFullDirName( filename) {
    if(path.dirname(filename) === '.'){
        filename= (process.cwd() + '\/' + filename);
    }
    return filename;
}

function checkFile( filename ){
    var regexp = /\.xlsx$|\.json$/i;
    var eFormat = new Error("Excel format is error... It should be [*.xlsx] or [*.json]");

    filename = generateFullDirName(filename);

    fs.stat(filename, function(err, stats) {
        if(err) {
            throw new Error(err);
        };
    } );

    if( ! regexp.test(filename)) throw  eFormat;
    return filename;
}

program
        .option('-f, --fileName [*.xlsx|*.json]', 'name of excel file', checkFile)
        .option('-D, --debug [trace|debug|info|warn|error]', 'enable debug mode', /trace|debug|info|warn|error/i, 'info')
        .option('-T, --checkDate ["2017-12-14"]', 'this option is only for date comparison applications', (new Date()).toISOString().split('T')[0])
        .parse(process.argv);


if( program.fileName === undefined ){
    console.error('Error: fileName required');
    process.exit(1);
}

//Beging to run ALL
console.time("propelReviewOneOrg");
console.log("************************************************************");
console.log("************ Run Review Permissions for one Org ************");
console.log("************************************************************");

var promise =  extractData.run( program );

promise
        .then( function( propelAccountsArray ) {

            program.propelObj = propelAccountsArray[0];
            return application.run( program );
        })
        .then( function() {
            console.timeEnd("propelReviewOneOrg");
        }) //deal with exception
        .catch( function(err) {
            console.log("XXXXXXXXX Review one org is Failed XXXXXXXXXXXXXX");
            console.log( err.message );
        });