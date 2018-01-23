/**
 * Created by pengl on 6/26/2017.
 */

const fs = require('fs');
const path = require('path');
const log = require('loglevel');

module.exports.run = function ( options ) {

    log.setLevel( options.debug );

    log.debug('***** This script will remove all files in images ******');

    var dirPath = path.join(__dirname, '../images');
    fs.readdirSync( dirPath ).forEach( file => {

        var fileName = file.toLowerCase();
        if( fileName.endsWith('.png')) {

            var imagePath = path.join(__dirname, '../images', file);
            fs.unlink( imagePath , function ( err ) {
                if( err ) {

                    log.debug(' -> Deleted image: ' + fileName);

                } else {

                    log.error(' -> Delete image failed: ' + fileName);
                }
            });
        }
    });
}