/**
 * Created by pengl on 6/29/2017.
 * Function:
 * * Update company code for several suppliers.
 */

const config = require('../../config/config.json');
const WebDriverFactory = require('../../util/src/WebdriverFactory');
const PropelCommand = require('../../util/src/PropelCommands');
const WebDriverCommand = require('../../util/src/WebdriverCommands');
const error = require('../../lib/error');
const message = require('../../lib/message');
const By = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;
const log = require('loglevel');
const path = require('path');
/**************************************************************
 * Import Propel Datas from Excel module
 *
 * */
/***************************************************************
 *
 * @type {number}
 */
const PROPEL_SERVER = config.propelServer;
const TIMEOUT = config.propelElementTimeout;
const BROWSER_TYPE = config.browser;
const REQUIRED_ADMIN_PERMISSION = config.permissionsOfOrgAdmin;

var permissionList = [];
var customerName = '';
var record = {};

/***************************************************************
 *  Main Processes:
 *  1) Distill permissions of role Org_Admin
 *  2) Check if it matches the default config
 ***************************************************************/

function run( options ) {

    return new Promise( function ( resolve, reject ) {

        log.setLevel( options.debug);

        customerName = options.propelObj.customerName;
        record.account = options.propelObj.account;
        record.password = options.propelObj.password;

        var driver = new WebDriverFactory( BROWSER_TYPE ).driver;

        var promise = PropelCommand.logInPropel(driver, PROPEL_SERVER, customerName, record.account, record.password);

        promise.then( function () {

                    update_SMC_CompanyCode( driver );
                })
                .then( function () {

                     update_SOD_CompanyCode( driver );
                })
                .then( function () {

                    tearDown( driver, promise );

                    var msg = new message.ConfigSuccessMessage("Update Company Code Successfully", options.propelObj);
                    resolve(msg);
                })
                .catch( function ( error ) {

                    log.debug(" ==> Oops, fail to review one org permissions...");
                    log.error( error );

                    PropelCommand.takeScreenShot( driver, 'review_oneOrg_permission_snapshot' + record.password);
                    tearDown( driver, promise);

                    var msg = new message.ConfigFailMessage( error.name, options.propelObj );
                    resolve( msg );
                })
    });
}

function tearDown( driver, promise ){

    driver.quit();

    promise.cancel();
}

function editCompanyCode( driver, supplierName ) {

    var supplierLocator = By.partialLinkText( supplierName );
    WebDriverCommand.clickButton( driver, supplierLocator, TIMEOUT);

    PropelCommand.removeSupplierPageShadowPanel( driver, TIMEOUT );

    var editLocator = By.linkText('Edit');
    WebDriverCommand.clickButton( driver, editLocator, TIMEOUT );

    var companyCodeLocator = By.name("companyCode");
    WebDriverCommand.sendKeysToInputElement( driver, companyCodeLocator, "ECS", TIMEOUT);

    var saveLocator = By.linkText("Save");
    WebDriverCommand.clickButton( driver, saveLocator, TIMEOUT);

    //wait for completion
    WebDriverCommand.waitElementAvailable( driver, editLocator, TIMEOUT );
}

function update_SMC_CompanyCode( driver ) {

    var url = PROPEL_SERVER + ':9400/suppliers';
    PropelCommand.getPropelUrl( driver, url );

    editCompanyCode( driver, "SMC" );
}

function  update_SOD_CompanyCode( driver ) {

    var url = PROPEL_SERVER + ':9400/suppliers';
    PropelCommand.getPropelUrl( driver, url );

    //wait for page loading
    var smcLocator = By.partialLinkText("SMC");
    WebDriverCommand.waitElementAvailable( driver, smcLocator, TIMEOUT);

    var sodLocator = By.linkText("SOD Supplier");
    driver.findElements( sodLocator ).then( function ( elements ) {

        if( elements.length > 0) {

            editCompanyCode( driver, "SOD Supplier");
        }
    });
}

function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

function configValidation( customerName ) {

    var compareResults = arr_diff( permissionList, REQUIRED_ADMIN_PERMISSION);

    log.info( " ==> Number of different permission is: " + compareResults.length + " " + customerName);
    log.info( compareResults );

    return compareResults;
}

module.exports = {
    run: run
}
