/**
 * Created by pengl on 3/27/2017.
 * Description:
 *       This script is used to extract Propel Login Info for each customer
 *       by Propel Org Excel or Json file
 * Parameters : xlsxFile | JsonFile
 * Return     : Array of JSON
 */


const xlsx = require('xlsx');
const fs = require('fs');
const log = require('loglevel');

/************************************************
 * Main Processes
 * 1) Import Excel, and find Account Sheet
 * 2) Get columns ID for required Attributes
 * 3) Extract info, fill it in one Array
 ************************************************/

const sheetName = 'Account';
const cellUrlName = 'URL';
const cellAccountName = 'Propel Account';
const cellPwdName = 'Propel Password';
const tenantName = 'QRS CUSTOMER NAME';

var propelAccountsArray = [];
var propelAccountsObj = {};
var propelOnDemandArray = [];

function run( options ){

    return new Promise( function(resolve, reject) {


        //set log level
        log.setLevel( options.debug );

        var fileType = (options.fileName).replace(/.*\./, '').toUpperCase();

        switch ( fileType ) {
            case 'JSON':

                distillFromJsonFile( options.fileName );
                break;
            case 'XLSX':

                distillFromXlsxFile( options.fileName );
                break;
            default:
                log.error(" -> File format is error: " + fileType);
        }

        resolve( propelAccountsArray );

    });
}

function distillFromXlsxFile( fileName ) {

    var json = parseExcel( fileName );

    extractPropelAccountsFromExcel( json );
}

function distillFromJsonFile( fileName ) {

    var json = parseJsonFile( fileName );

    extractPropelAccountFromJson( json );
}

function parseJsonFile( fileName ) {

    var buffer = fs.readFileSync( fileName);

    return JSON.parse( buffer );
}


function removeDumpDataFromExcel( dataSheet ) {
    for(var i=0; i<dataSheet.length; i++){
        var obj = dataSheet[i];
        if(!obj.hasOwnProperty('URL')){
            dataSheet.splice(i, 1);
            i--;
        }
    }
    return dataSheet;
}

function parseExcel( fileName ) {

    var workbook, worksheet;
    workbook = xlsx.readFile( fileName );
    worksheet = workbook.Sheets[sheetName];

    var data = xlsx.utils.sheet_to_json(worksheet);
    var jsonList = removeDumpDataFromExcel(data);

    return jsonList;
}

function displayFetchedData() {

    //Display results
    log.debug("Extract: The num of orgs under operation is: " + propelAccountsArray.length);
    log.debug(propelAccountsArray);
    log.trace(propelAccountsObj);
    log.trace(propelOnDemandArray);
}

function extractPropelAccountFromJson( list ) {

    for(var k=0; k< list.length; k++) {

        var obj = list[k];
        propelAccountsArray.push( obj );
        propelAccountsObj[obj.url] = obj ;
    }

    displayFetchedData();

}

function extractPropelAccountsFromExcel( list ) {


    for (var k=0; k< list.length ; k++) {
        var customerRecord = {url: '', account: 'migration', password: ''};
        customerRecord.url = list[k][cellUrlName];
        customerRecord.account = list[k][cellAccountName];
        customerRecord.password = list[k][cellPwdName];

        var customerName = list[k][cellUrlName];
        customerName = customerName.slice( customerName.lastIndexOf('/') + 1);
        customerRecord.customerName = customerName.toLowerCase();

        //add two exceptions
        if( "aimia-ess" ===  customerName.toLowerCase() || "aimia-mcc" ===  customerName.toLowerCase() || "pb1uatcan" === customerName.toLowerCase() ) {

            customerRecord.customerName = customerName.toUpperCase();
        }

        if( "vpcdemo1" === customerName.toLowerCase() ) {

            customerRecord.customerName = "VPCDemo1";
        }

        if( "vpcdemo2" === customerName.toLowerCase() ) {

            customerRecord.customerName = "VPCDemo2";
        }
        propelAccountsArray.push( customerRecord );
        propelAccountsObj[customerRecord.url] = customerRecord;

        var objOnDemand = {};
        objOnDemand.tenantName = list[k][tenantName];
        objOnDemand.passwordCredentials = {
            'username': list[k][cellAccountName],
            'password': list[k][cellPwdName]
        };
        propelOnDemandArray.push( objOnDemand );
    }

    displayFetchedData();
}

module.exports = {
    propelAccountList : propelAccountsArray,
    propelAccountObj  : propelAccountsObj,
    run : run
};
