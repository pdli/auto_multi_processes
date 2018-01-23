#!/usr/bin/env node

/**
 * Created by pengl on 4/10/2017.
 */

const commander = require('commander');
const pkg = require('./package.json');
const extractData = require('./src/extractPropelAccounts.js');
const clearLogs = require('./src/clearLogs');
const configApp = require('./src/configApplication');
const fs = require('fs');
const path = require('path');

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

commander
    .version(pkg.version)
    .usage('[command] [options]');

commander
    .command('extract')
    .description('distill Propel Info from Excel file')
    .option('-f, --fileName [*.xlsx|*.json]', 'name of excel file', checkFile)
    .option('-D, --debug [trace|debug|info|warn|error]', 'enable debug mode', /trace|debug|info|warn|error/i, 'info')
    .action(function(options){
          if( options.fileName === undefined || options === undefined ) {
             console.warn('Oops, forget to add options...');
         } else {
             extractData.run( options );
         }
    });

commander
        .command('clearlogs')
        .description('clear all files in images.')
        .option('-D, --debug [trace|debug|info|warn|error]', 'enable debug mode', /trace|debug|info|warn|error/i, 'info')
        .action(function(options){
            if( options === undefined ) {
                console.warn('Oops, forget to add options...');
            } else {
                clearLogs.run( options );
            }
        });

commander
        .command('configApp')
        .description('Choose one application to be implemented in src/applications')
        .option('-D, --debug [trace|debug|info|warn|error]', 'enable debug mode', /trace|debug|info|warn|error/i, 'info')
        .action(function(options){
            if( options === undefined ) {
                console.warn('Oops, forget to add options...');
            } else {
                configApp.run( options )
                    .catch( function (err) {
                        console.log("XXXXX");
                        console.log(err);
                    });
            }
        });


commander
        .command('reviewOneOrg <fileName>', 'review admin_org role permissions for one Propel Org').alias('reviewOne');

commander
        .command('reviewAllOrg <fileName>', 'review admin_org role permissions for All Propel Org').alias('reviewAll');


commander.parse(process.argv);
