/**
 * Created by pengl on 12/20/2017.
 */

/**
 * Checkbox list examples
 */

const inquirer = require('inquirer');
const io = require('selenium-webdriver/io');
const fs = require('fs');
const appCfgFile = "./src/applications/appCfg.json";
const appPath = './src/applications';
const SKIP_CFG_SIGNAL = 200;

var log;

module.exports.run = function( options ) {

    setUp( options );

    return new Promise( function (resolve, reject) {

        io.read( appCfgFile )
            //read default config
            .then( function (buffer) {

                var appCfgJson = JSON.parse(buffer);
                return appCfgJson.chosenApp;
            })
            //confirm if configuration needed
            .then( function( chosenApp ) {

                return confirmIfCfgNeeded( chosenApp );
            })
            //list all applications
            .then( function(){

                var appList = fs.readdirSync( appPath ).filter( function (str) {
                    return str.endsWith('js');
                });

                return appList;
            })
            //chose the required One
            .then( function ( appList ) {

                return runInquirerToChooseApplication( appList );
            })
            //write to applications/appCfg.json file
            .then( function ( answers ) {

                return writeToAppCfgFile( answers );
            })
            //resolved
            .then( function ( answers ) {

                log.debug("Thanks for your choice: " + answers.chosenApp[0] );
                resolve();
            })
            // If customized signal received, resolve it.
            // Otherwise, reject it.
            .catch( function ( msg ) {

                if( SKIP_CFG_SIGNAL !== msg ){

                    reject( msg );
                } else {

                    resolve();
                }
            });

    });
}

function confirmIfCfgNeeded( chosenApp ) {

    var questions = [
        {
            type: 'confirm',
            name: 'isCorrect',
            message: 'Is it the correct application to be implemented: '+ chosenApp +'?'
        }
    ];

    return inquirer.prompt( questions )
        .then(answers => {
            if (true === answers.isCorrect) {

                log.info("==> The one is RIGHT, further cfg operation is SKIPPED: " + chosenApp );
                throw SKIP_CFG_SIGNAL;

            } else
            {
                log.info("==> OK, go on the application configuration.");
            }
    });
}

function writeToAppCfgFile ( answers ) {

    return io.read( appCfgFile )
        .then( function (buffer) {

            var json = JSON.parse( buffer );
            json.chosenApp = answers.chosenApp[0];

            return json;
        })
        .then( function(json){

            return io.write( appCfgFile, JSON.stringify( json ))
                .then( function () {
                    return answers;
                });
        })
        .catch( function(error) {

            throw error;
        });
}

function setUp(options){

    const log4js = require('log4js');
    log4js.configure("./config/log4js.json");
    log = log4js.getLogger( options.debug );
}

function runInquirerToChooseApplication(list ){
    //initiate body
    var promptBody = [
        {
            type: 'checkbox',
            message: 'Select one application to be implemented',
            name: 'chosenApp',
            choices: [
                new inquirer.Separator(' = = = '+ list.length +' = = = '),
            ],
            validate: function(answer) {
                if (answer.length !== 1) {
                    return 'You must choose ONLY one application.';
                }
                return true;
            }
        }];
    //build body with application scripts
    for(var i=0; i< list.length; i++){

        var json = {name: list[i]};
        promptBody[0].choices.push( json );
    }
    //run inquire
    return inquirer
        .prompt( promptBody )
        .then(answers => {
            console.log(JSON.stringify(answers, null, '  '));

            return answers;
        });
}