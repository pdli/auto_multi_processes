/**
 * Created by pengl on 01/10/2018.
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

const PROPEL_SERVER = config.propelServer;
const TIMEOUT = config.propelElementTimeout;
const BROWSER_TYPE = config.browser;

const dwURL = "https://directoryworks.hpecorp.net/protected/people/view/accounts/?pc_start=120";

var log;
/***************************************************************
 *  Main Processes:
 *  1) Go to Directory Works
 *  2) Add one more owner in to accounts
 ***************************************************************/

function run( options ) {

    return new Promise( function(resolve, reject) {

        setUp( options );

        var driver = new WebDriverFactory( BROWSER_TYPE ).driver;

        var promise = driver.get( dwURL );

        promise
            .then( function () {

                return add_Owners_In_one_page( driver );
            })
            .then( function () {

                PropelCommand.takeScreenShot( driver, 'add_owner_in_DW_' );
                PropelCommand.tearDown( driver, promise );

                var msg = new message.ConfigSuccessMessage("Update Company Code Successfully", options.propelObj);
                resolve(msg);
            })
            .catch( function ( error ) {

                log.debug(" ==> Oops, fail to review one org permissions...");
                log.error( error );

                PropelCommand.takeScreenShot( driver, 'failedTo_add_owner_in_DW_' );
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
}

function add_Owners_In_one_page( driver ) {

    var resultsLocator = By.className('resultsColHdr');
    return driver.findElements( resultsLocator ).then( function ( elements ) {

        log.debug( 'Recording: ' + elements.length );

        for(var i=0; i<elements.length; i++){

            ( function ( i ) {

                var index = i + 1;
                log.debug( index );
                var accountLocator = By.xpath('(//td[@class="resultsColHdr"]/a)['+ index +']');
                WebDriverCommand.clickButton( driver, accountLocator, TIMEOUT);

                //edit
                var editBtnLocator = By.xpath('(//td[@class = "mpHdrAction"]/a)[2]');
                WebDriverCommand.clickButton( driver, editBtnLocator, TIMEOUT);

                //choose email
                var selectLocator = By.xpath('//select[@id = "mtm_search_type_people"]/option[@value = "mail"]');
                WebDriverCommand.clickButton( driver, selectLocator, TIMEOUT);

                //input new owner
                var inputLocator = By.id('mtm_search_val');
                WebDriverCommand.sendKeysToInputElement( driver, inputLocator, "yong.yang@hpe.com", TIMEOUT);

                var findBtnLocator = By.id('mtm_search_submit');
                WebDriverCommand.clickButton( driver, findBtnLocator, TIMEOUT);

                var resultsLocator = By.xpath('(//select[@id= "mtm_left_menu"]/option)[1]');
                WebDriverCommand.clickButton( driver, resultsLocator, TIMEOUT);

                var addBtnLocator = By.name('add_to_list_button');
                WebDriverCommand.clickButton( driver, addBtnLocator, TIMEOUT);

                var saveBtnLocator = By.xpath('//input[@value = "Save"]');
                WebDriverCommand.clickButton( driver, saveBtnLocator, TIMEOUT);

                //check result
                var ownersLocator = By.xpath('//select[@name = "menu"]/option[@value ="uid=yong.yang@hpe.com,ou=People,o=hp.com"]');
                WebDriverCommand.waitElementLocated( driver, ownersLocator, TIMEOUT);

                driver.get( dwURL );
            })(i);
        }
    });
}


module.exports = {
    run: run
}

