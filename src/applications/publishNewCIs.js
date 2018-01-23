/**
 * Created by pengl on 9/11/2017.
 * Function:
 * * Add categories
 * * Publish new CI
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
const TIMEOUT_ORGCHECK = config.propelValidLoadingTime;
const BROWSER_TYPE = config.browser;
const CATEGORIES = config.categoriesList;
const CATALOG_ITEMS = config.catalogItems;

var log;
var urlName = '';
var orgAdminAccount = '';
var orgAdminPwd = '';
/***************************************************************
 *  Main Processes:
 *  1) Distill permissions of role Org_Admin
 *  2) Check if it matches the default config
 ***************************************************************/

function run( options ) {

    return new Promise( function(resolve, reject) {

        setUp( options );

        var driver = new WebDriverFactory( BROWSER_TYPE ).driver;

        var promise = PropelCommand.logInPropel(driver, PROPEL_SERVER, urlName, orgAdminAccount, orgAdminPwd);

        promise
            .then( function () {

                addCategories( driver, CATEGORIES );
            })
            .then( function () {

                publishCIs( driver, CATALOG_ITEMS );
            })
            .then( function () {

                checkMarketPlace( driver, urlName );
            })
            .then( function () {

                PropelCommand.takeScreenShot( driver, 'addServiceRequestCI_' + urlName);
                PropelCommand.tearDown( driver, promise );

                var msg = new message.ConfigSuccessMessage("Update Company Code Successfully", options.propelObj);
                resolve(msg);
            })
            .catch( function ( error ) {

                log.debug(" ==> Oops, fail to review one org permissions...");
                log.error( error );

                PropelCommand.takeScreenShot( driver, 'failedTo_addServiceRequestCI_' + urlName);
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

function checkMarketPlace( driver, urlName ) {

    var url = PROPEL_SERVER + ':9010/shop/catalog';
    PropelCommand.getPropelUrl( driver, url );
    PropelCommand.waitPageLoading( driver, TIMEOUT );

    //PropelCommand.takeScreenShot( driver, "marketPlace_addCI_"+ urlName);
}
function addCategories( driver, categoryList ) {

    //go to Categories
    var url = PROPEL_SERVER + ':9500/categories';
    PropelCommand.getPropelUrl( driver, url );
    PropelCommand.waitPageLoading( driver, TIMEOUT );
    driver.wait(until.titleContains('Categories'), TIMEOUT);

    //if existed, ignore; Otherwise, add it.
    for(var i=0; i< categoryList.length; i++) {
        addOneCategory( driver, categoryList[i] );
    }
}

function addOneCategory( driver, category ){

    //wait for full page loading in Categories
    PropelCommand.waitPageLoading( driver, TIMEOUT );
    var administratedByMeLocator = By.xpath('//span[text() = "Administered by me"]');
    WebDriverCommand.waitElementLocated( driver, administratedByMeLocator, TIMEOUT);

    var catLocator = By.xpath('//span[contains( text(), "'+ category +'")]');
    driver.findElements( catLocator ).then( function( eleList ) {
        if( eleList.length < 1) { //doesn't exist

            log.debug(' => Begin to create Category - ' + category);

            var addLocator = By.id('subheader-createSubategory');
            WebDriverCommand.clickButton( driver, addLocator, TIMEOUT);

            removeShadowPanel( driver );

            var nameLocator = By.id('name');
            WebDriverCommand.sendKeysToInputElement( driver, nameLocator, category, TIMEOUT );

            var createLocator = By.id('createButton');
            WebDriverCommand.clickButton( driver, createLocator, TIMEOUT );

            //go back to categories page
            var url = PROPEL_SERVER + ':9500/categories';
            PropelCommand.getPropelUrl( driver, url );
            PropelCommand.waitPageLoading( driver, TIMEOUT);
        } else {
            log.debug(' => Category - ' + category +' already existed...');
        }
    });
}


function removeShadowPanel( driver ) {
    //set invisible
    var panelLocator = By.className('reveal-modal-bg fade in');
    driver.wait(until.elementLocated( panelLocator ), TIMEOUT);
    driver.executeScript('var x = document.getElementsByClassName("reveal-modal-bg fade in");' +
        ' x[0].style = "display: none;display: none"');
}

function publishCIs( driver, catalogItemList ) {
    
    
    for(var i=0; i<catalogItemList.length; i++){

        //go to Catalog Items page
        var url = PROPEL_SERVER + ':9500/items';
        PropelCommand.getPropelUrl( driver, url );
        PropelCommand.waitPageLoading( driver, TIMEOUT );
        driver.wait(until.titleContains('Catalog Items'), TIMEOUT);

        addOneCatalogItem( driver, catalogItemList[i] );
    }    
}

function  addOneCatalogItem( driver, catalogItem ) {

    //get item name
    var itemName = Object.keys(catalogItem).pop();
    var delItem = catalogItem[itemName][0]; //only the 1st item should be deleted
    var addItems = catalogItem[itemName].slice(1); //the others should be added

    //click item
    var itemLocator = By.xpath('//span[text() = "'+ itemName +'"]');
    driver.wait(until.elementLocated( itemLocator ), TIMEOUT).then( function () {
        log.info(' => Begin to add Catalog Item -- ' + itemName);
    });
    WebDriverCommand.clickButton( driver, itemLocator, TIMEOUT);

    var editLocator = By.id('editButton');
    WebDriverCommand.clickButton( driver, editLocator, TIMEOUT);

    //remove default categories
    var defaultLocator = By.xpath('//span[contains(@title, "'+ delItem +'")]//I');
    driver.findElements( defaultLocator ).then( function( eleList){
        if(eleList.length > 0){
            eleList[0].click();
        }
    }).then( function () {
        log.debug("  Delete Item completed -- " + delItem);
    });

    //add categories for one catalog Item
    for( var i=0; i<addItems.length; i++){

        addOneCategory_inCatalogItem( driver, addItems[i] );
    }

    //save categories
    var saveLocator = By.id('saveButton');
    WebDriverCommand.clickButton(driver, saveLocator, TIMEOUT);

    PropelCommand.waitPageLoading( driver, TIMEOUT );

    //wait for saved
    var savedLocator = By.xpath('//span[text() = "Saved"]');
    WebDriverCommand.waitElementLocated( driver, saveLocator, TIMEOUT);

    //go to access control panel
    driver.getCurrentUrl().then( function ( url ) {
        PropelCommand.getPropelUrl( driver, url + '/access');
    })

    PropelCommand.waitPageLoading( driver, TIMEOUT );

    var grantedLocator = By.xpath('//td[contains(text(), "Propel Users")]');
    driver.wait(until.elementLocated( grantedLocator ), TIMEOUT_ORGCHECK).then(
        function(){

            log.debug('  Access control for Propel Users already done...');
        }, function grantAccess() {

            var grantLocator = By.xpath('//button[text() = "Grant access"]');
            WebDriverCommand.clickButton( driver, grantLocator, TIMEOUT);

            removeShadowPanel( driver );

            var optionLocator = By.xpath('//select[@id = "group"]/option[text() = "Propel Users"]');
            WebDriverCommand.clickButton( driver, optionLocator, TIMEOUT);

            var submitLocator = By.xpath('//button[text() = "Grant Access"]');
            WebDriverCommand.clickButton( driver, submitLocator, TIMEOUT).then( function () {

                log.debug("  Access control for Propel Users is done");
            });

            PropelCommand.waitPageLoading( driver, TIMEOUT );
        }
    );

    //publish catalog item
    var publishLocator = By.id('publishItem');
    WebDriverCommand.clickButton( driver, publishLocator, TIMEOUT );

    PropelCommand.waitPageLoading( driver, TIMEOUT );

    //wait for publish options loading
    var publishItemLocator = By.xpath('//h3[text() = "Publish item to catalog"]');
    WebDriverCommand.waitElementLocated( driver, publishItemLocator, TIMEOUT_ORGCHECK );

    var mvpcLocator = By.xpath('//select[@id = "catalog"]/option[text() = "Managed Virtual Private Cloud"]');
    driver.wait(until.elementLocated( mvpcLocator ), TIMEOUT_ORGCHECK).then(
        function publishNow( ) {

            WebDriverCommand.clickButton( driver, mvpcLocator, TIMEOUT);
            WebDriverCommand.clickButton( driver, By.id('publish'), TIMEOUT);

            //wait for completion of publish
            WebDriverCommand.waitElementLocated( driver, By.id('unpublishItem'), TIMEOUT).then( function () {

                log.debug("  Item is published in MVPC Catalog");
            });

        }, function doneBefore(){

            //No Catalogs for publishing Item
            var cancelLocator = By.xpath('//a[text() = "×"]');
            driver.findElement( cancelLocator ).click().then( function () {
                log.debug("  Item already published in MVPC Catalogs...");
            });
        }
    ).then( function () {

        //PropelCommand.takeScreenShot( driver, 'addServiceRequestCI_' + urlName);
    });
}


function addOneCategory_inCatalogItem( driver, category ) {

    var addItemLocator = By.id('selectCategory');
    WebDriverCommand.clickButton( driver, addItemLocator, TIMEOUT );

    removeShadowPanel( driver );

    var categoryLocator = By.xpath('(//ul[@id="containerList"]//span[text() = "'+ category +'"])[1]');
    driver.wait(until.elementLocated( categoryLocator ), TIMEOUT).then( function () {
        log.debug('  Category will be added -- ' + category );
    });
    WebDriverCommand.clickButton( driver, categoryLocator, TIMEOUT);

    var okLocator = By.id('ok');
    WebDriverCommand.clickButton( driver, okLocator, TIMEOUT);

    //wait for added completion
    var itemLocator = By.xpath('//span[@title = "'+ category +'"]//span[text()="'+ category +'"]');
    WebDriverCommand.waitElementLocated( driver, itemLocator, TIMEOUT);
}

module.exports = {
    run: run
}

