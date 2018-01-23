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
const config = require('../config/config.json');
const message = require('../lib/message');
const log = require('loglevel');
const fs = require('fs');


function reduceFinalResults( failedCasesList ) {

    var fileName = 'failedCases.json';

    log.info(' -> Finally, completed <- ');
    log.info(" -> Here is the list of failed cases: " + failedCasesList.length);
    log.info( failedCasesList );
    fs.writeFileSync( fileName , JSON.stringify( failedCasesList), 'utf8');
    log.info(" -> Failed cases documented here: " + fileName);
}


function analyseMsgFromChildProcess( msg, failedCasesList, dataInfo ) {

    if( msg.name !== message.ConfigMatchedMessage.name && msg.name !== message.ConfigSuccessMessage.name ) {

        console.log( msg );
        failedCasesList.push( dataInfo );
    }
}


module.exports = {

    analyseMsgFromChildProcess: analyseMsgFromChildProcess,
    reduceFinalResults: reduceFinalResults
};