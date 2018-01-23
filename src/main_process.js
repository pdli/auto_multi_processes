/**
 * Created by pengl on 6/19/2017.
 * Description:
 *      1) queue child_process -> map
 *      2) collect final results -> reduce
 *      3) generate report of failed cases
 * Parameters : dataList, debug mode
 * Return     : None
 */

//import modules
const appInCall = require('./main_process_Callback');
const config = require('../config/config.json');
const { fork } = require('child_process');
const log = require('loglevel');
const fs = require('fs');

//global variables
const MAX_PROCESSES = config.maxProcesses;
var pendingDataList = [];
var failedCasesList = [];

//main function
function run(  dataList, options ) {

    return new Promise( function (resolve, reject) {

        log.setLevel( options.debug );
        pendingDataList = dataList;

        log.info( '*************** Number of Processes to be dealt with is: ' + pendingDataList.length + ' *****************' );

        var processesQueue = [];

        //query status of process queue
        setInterval(() => {

            //maintain Process Queue
            //check length of pending queue: pendingDataList
            //check length of running queue: processesQueue
            if(  pendingDataList.length >0 && processesQueue.length < MAX_PROCESSES ) {

                //remove one from pending queue
                var dataInfo = pendingDataList.pop();

                //running
                var promise = loadProcess( dataInfo, options);

                //add one in running queue
                processesQueue.push( promise );

                promise
                        .then( function ( msg ) {

                            analyseMsgFromChildProcess( msg, dataInfo );
                            //remove one from running queue
                            processesQueue.pop();
                        })
                        .catch( function( error ) {

                            processesQueue.pop();
                            failedCasesList.push( dataInfo );
                            log.error(' -> Sub-process failed. Already log it in failed cases list => ' + dataInfo.url);
                        });
            }

            //reduce final result, report it.
            if(  processesQueue.length <1) {

                reduceFinalResults();

                //quit current process, log time
                resolve();
                process.exit();
            }
        }, 6000);

    });
}


function reduceFinalResults() {

    log.info(' ==> Finally, completed <== ');

    appInCall.reduceFinalResults( failedCasesList );

}

function analyseMsgFromChildProcess( msg, dataInfo ) {

    //deal with result of running process
    log.debug(' -> received msg from child_process is '  );
    log.debug( msg );

    appInCall.analyseMsgFromChildProcess( msg, failedCasesList, dataInfo);
}

function loadProcess(propelObj, options ) {

    return new Promise( function(resolve, reject) {

        var msg = {
            propelObj: propelObj,
            debug: options.debug,
            checkDate: options.checkDate
        };

        log.debug("parent msg is: ");
        log.debug( msg );

        var receivedMsg = '';

        var forked = fork('./src/child_process.js');

        forked.on('message', (msg) => {
            log.debug(" -> Message from child", msg);
            receivedMsg = msg;
        });

        forked.on('error', ()=> {
            reject();
        });

        forked.on('exit', (code, signal) => {

            resolve( receivedMsg );
            log.debug(" -> Process exit: " + code + " " + signal);
        });

        forked.send( msg );
    });
}


module.exports = {
    run: run
};
