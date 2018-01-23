/**
 * Created by pengl on 9/18/2017.
 * Function:
 * * Update permissions in ORG_ADMIN
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
const ORG_ADMIN_ACC = "admin";
const ORG_ADMIN_PWD = "admin";

//update USER_ROLE for each requested role
//const USER_ROLE = "VPC_NETWORK_ADMINISTRATOR";
const USER_ROLE = "VPC_SUBSCRIPTION_ADMIN";
const USER_ROLE_TEMPLATE = "VPC_SUBSCRIPTION_ADMIN";

var log;
var urlName = '';
/***************************************************************
 *  Main Processes:
 *  1) Distill permissions of role Org_Admin
 *  2) Check if it matches the default config
 ***************************************************************/

function run( options ) {

    return new Promise( function(resolve, reject) {

        setUp( options );

        var driver = new WebDriverFactory( BROWSER_TYPE ).driver;

        var promise = PropelCommand.logInPropel(driver, PROPEL_SERVER, 'org', ORG_ADMIN_ACC, ORG_ADMIN_PWD);

        promise
            .then( function () {

                editVpcPortalUserRole( driver, urlName );
            })
            .then( function () {

                //PropelCommand.takeScreenShot( driver, 'updateRole_' + urlName);
                PropelCommand.tearDown( driver, promise );

                var msg = new message.ConfigSuccessMessage("Update Company Code Successfully", options.propelObj);
                resolve(msg);
            })
            .catch( function ( error ) {

                log.debug(" ==> Oops, fail to update role for one org ...");
                log.error( error );

                PropelCommand.takeScreenShot( driver, 'failedTo_updateRole_' + urlName);
                PropelCommand.tearDown( driver, promise);

                var msg = new message.ConfigFailMessage( error.name, options.propelObj );
                resolve( msg );
            })
    });
}

function editVpcPortalUserRole( driver, urlName ) {

    log.debug(' => Start to edit role: ' + USER_ROLE);

    var url = PROPEL_SERVER + ':9200/organization/' + urlName + '/role';
    PropelCommand.getPropelUrl( driver, url);
    PropelCommand.waitPageLoading( driver, TIMEOUT );

    goToEditDedicatedRolePage( driver, urlName, USER_ROLE );

    //checkIfOnePermissionExisted( driver, urlName, 'CPIAdmin');

    clearDefaultPermissionsOfOneRole( driver, USER_ROLE );

    addPermissionsForOneRoleByTemplate( driver, urlName, USER_ROLE );
}

function checkIfOnePermissionExisted( driver, urlName, permission ) {

    var permissionTabLocator = By.xpath('//legend[text() = "Associated Permissions"]');
    WebDriverCommand.waitElementAvailable(driver, permissionTabLocator, TIMEOUT);

    var permissionLocator = By.xpath('//div[@class = "column small-11 ng-binding" and contains(text(), "'+ permission +'")]');
    driver.findElements( permissionLocator ).then( function ( elements ) {

        if(elements.length >0){

            throw new Error( permission + ' was created for Org: ' + urlName);
        }
    });
}

function goToEditDedicatedRolePage( driver, urlName, roleName ) {

    var dedicatedRoleLocator = By.xpath('//div[@class = "row list-item ng-scope"]//small[text()="' + roleName + '"]/ancestor::div[@class="row list-item ng-scope"]'
        + '//a[contains(@href, "/organization/' + urlName + '/")]');

    driver.findElements( dedicatedRoleLocator ).then( function ( elements ) {

        if( elements.length <1) {

            throw " ########### Role was NOT created for org: " + urlName + " ###############";

        } else {

            WebDriverCommand.clickButton(driver, dedicatedRoleLocator, TIMEOUT);
            PropelCommand.waitPageLoading( driver, TIMEOUT );
        }
    });
}

function clearDefaultPermissionsOfOneRole( driver, roleName ) {

    PropelCommand.waitPageLoading( driver, TIMEOUT);

    var permissionTabLocator = By.xpath('//legend[text() = "Associated Permissions"]');
    WebDriverCommand.waitElementAvailable(driver, permissionTabLocator, TIMEOUT);

    var trashLocator = By.className('lifecycle-icon-Trash');
    driver.findElements( trashLocator )
        .then( function( webElements ) {

            for (var i = webElements.length-1; i >=0 ; i--) {
                webElements[i].click();
            }
        })
        .then( function () {

            log.debug("  --> Delete default permissions for role: " + roleName );
        });
}

function addPermissionsForOneRoleByTemplate( driver, urlName, roleName ){

    var templateOptLocator = By.xpath('//select[@ng-model = "vm.selectedRoleTemplate"]/option[@label = "'+ USER_ROLE_TEMPLATE +'"]');
    WebDriverCommand.clickButton( driver, templateOptLocator, TIMEOUT).then( function () {

        log.debug(' --> Add permissions for role: ' + roleName );
    });

    //Save button
    var saveBtnLocator = By.xpath('//button[text()="Save"]');
    WebDriverCommand.clickButton(driver, saveBtnLocator, TIMEOUT);

    PropelCommand.takeScreenShot(driver, USER_ROLE_TEMPLATE + '_' + urlName );

    PropelCommand.waitPageLoading( driver, TIMEOUT );

    //Wait for completion
    var roleTabLocator = By.xpath('//h3[@class="title-upcase ng-binding" and contains(text(), "Roles")]');
    WebDriverCommand.waitElementAvailable(driver, roleTabLocator, TIMEOUT);
}

function setUp( options ) {

    const log4js = require('log4js');
    log4js.configure("./config/log4js.json");
    log = log4js.getLogger( options.debug );

    urlName = options.propelObj.customerName;
}

module.exports = {
    run: run
}
