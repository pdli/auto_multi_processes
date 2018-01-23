/**
 * Created by pengl on 7/3/2017.
 * Description:
 *     Build external error msg
 */

'user strict';

class ReviewOneError extends Error {

    /** @param {string=} opt_error the error message, if any. */
    constructor(opt_error ) {
        super(opt_error);

        /** @override */
        this.name = this.constructor.name;
    }
}

module.exports = {

    ReviewOneError: ReviewOneError
}
