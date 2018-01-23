/**
 * Created by pengl on 6/19/2017.
 * Description:
 *      using child_process for parallel restartOneOrgSuppliers
 *      taking node.child_process.fork as the solution.
 *      this script is only for multi-process framework, w/o business stuff
 * Parameters : message based
 * Return     : None
 */


const reviewOne = require('./child_process_Adapter');
const config = require('../config/config.json');
const log = require('loglevel');

process.once('message', (msg) => {

    run( msg );
});

function run( msg ) {

    //set trace level
    log.setLevel( msg.debug );

    var promise = new Promise( function(resolve, reject){
        resolve();
    });

    log.debug(' -> Message from parent:', msg);

    promise
            .then( function () {

                return reviewOne.run( msg );
            })
            .then( function ( msg ) {

               // var body = JSON.stringify( msg.propelObj );
                //log.debug("I am in child process");
                //log.debug( results );
                process.send( msg );
            })
            //remove catch, all exception will be dealt in main_process.catch.
            //.catch()
}
