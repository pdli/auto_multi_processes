/**
 * Created by pengl on 9/18/2017.
 */


const io = require('selenium-webdriver/io');
const appCfgFile = "./src/applications/appCfg.json";
const appPath = './applications/';
//const application = require('./applications/restart_Org_Aggregation');

module.exports.run = function( msg ){

    return io.read( appCfgFile )
        //get chosen application
        .then( function ( buffer ) {

            var data = JSON.parse( buffer );

            if( undefined === data || undefined === data.chosenApp ){
                return undefined;
            }
            return data.chosenApp;
        })
        .then( function ( chosenApp ) {

            console.log( 'Adapter....');
            console.log( appPath + chosenApp );

            var application = require( appPath + chosenApp );
            return application.run( msg );
        })
        .catch( function (error) {

            throw error;
        });
}
