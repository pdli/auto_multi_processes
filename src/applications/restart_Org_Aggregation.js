/**
 * Created by pengl on 9/11/2017.
 */
const config = require('../../config/config.json');
const WebDriverFactory = require('../../util/src/WebdriverFactory');
const PropelCommand = require('../../util/src/PropelCommands');
const WebDriverCommand = require('../../util/src/WebdriverCommands');
const error = require('../../lib/error');
const message = require('../../lib/message');
const By = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;
const path = require('path');

//user configurable
const AGGREGATION_LIST = require('./../../config/C_restart_aggregation_List.json').suppliers;

//global variable
const PROPEL_SERVER = config.propelServer;
const TIMEOUT = config.propelElementTimeout;
const TIMEOUT_ORGCHECK = config.propelValidLoadingTime;
const BROWSER_TYPE = config.browser;

var log;
var urlName = '';
var orgAdminAccount = '';
var orgAdminPwd = '';
/***************************************************************
 *  Main Processes:
 *  1) Log in customer Propel URL with Org_Admin
 *  2) Restart customized suppliers in :9400/aggregation
 ***************************************************************/

function run( options ) {

    return new Promise( function(resolve, reject) {

        setUp( options );

        var driver = new WebDriverFactory( BROWSER_TYPE ).driver;

        var promise = PropelCommand.logInPropel(driver, PROPEL_SERVER, urlName, orgAdminAccount, orgAdminPwd);

        promise
            .then( function () {

                restartAggregation( driver );
            })
            .then( function () {

                PropelCommand.takeScreenShot( driver, 'restart_aggregation_' + urlName);
                PropelCommand.tearDown( driver, promise );

                var msg = new message.ConfigSuccessMessage("Update Company Code Successfully", options.propelObj);
                resolve(msg);
            })
            .catch( function ( error ) {

                log.debug(" ==> Oops, fail to review one org permissions...");
                log.error( error );

                PropelCommand.takeScreenShot( driver, 'failedTo_restart_aggregation_' + urlName);
                PropelCommand.tearDown( driver, promise);

                var msg = new message.ConfigFailMessage( error.name, options.propelObj );
                resolve( msg );
            })
    });
}

function setUp( options ) {

    const log4js = require('log4js');
    log4js.configure("./config/log4js.json");
    log = log4js.getLogger( options.debug );

    urlName = options.propelObj.customerName;
    orgAdminAccount = options.propelObj.account;
    orgAdminPwd = options.propelObj.password;
}

function goToAggregationPage(driver ) {

    var url = PROPEL_SERVER + ":9400";
    PropelCommand.getPropelUrl( driver, url );
    PropelCommand.waitPageLoading( driver, TIMEOUT );

    //Assumption: each org has at least one supplier
    var aggregationListLocator = By.className('fa fa-ellipsis-v');
    WebDriverCommand.waitElementAvailable( driver, aggregationListLocator, TIMEOUT );
}

function restartAggregation( driver ) {

    goToAggregationPage( driver );

    //if no supplier created, exit without any operation
    var supplierLocator = By.xpath('//div[@class = "system-icon tile left"]/a');
    driver.findElements( supplierLocator ).then( function ( elements ) {

        log.info( " => Begin to restart "+ elements.length +" Aggregations for Org: " + urlName );

        for( var i=0; i< elements.length; i++) {

           restartOneSupplier( driver, i, elements.length );
        }
    });
}

function restartOneSupplier( driver, index, length ) {

    index = index +1;

    var supplierLocator = By.xpath('(//div[@class = "system-icon tile left"])['+ index +']/a');

    driver.findElement( supplierLocator ).getText()
        .then( function (str) {


            if( AGGREGATION_LIST.includes( str)) {
                return str;

            } else {

                throw '  --> No need to restart '+ index + '/' + length +' aggregation for Org - '+ urlName +' : ' + str;
            }
        })
        .then( function (str) {

            log.debug('  --> Restart '+ index + '/' + length +' aggregation for Org - '+ urlName +' : ' + str );
            //click icon for each supplier
            driver.findElement( supplierLocator ).click();
            PropelCommand.waitPageLoading( driver, TIMEOUT );

            var ellipsisLocator = By.className('fa fa-ellipsis-v');
            WebDriverCommand.clickButton( driver, ellipsisLocator, TIMEOUT );

            //restart btn
            var restartLocator = By.id('start-button');
            WebDriverCommand.clickButton( driver, restartLocator, TIMEOUT );
            PropelCommand.waitPageLoading( driver, TIMEOUT );

            //wait for progress start
            var progressLocator = By.className('aggregation-progress');
            WebDriverCommand.waitElementAvailable( driver, progressLocator, TIMEOUT );

            //wait for progress completed
            WebDriverCommand.waitElementStaleness( driver, progressLocator, TIMEOUT * 3);

            //go back to aggregation page
            goToAggregationPage( driver );
        })
        .catch( function ( error ) {

            log.debug( error );
        });
}

module.exports = {
    run: run
}

