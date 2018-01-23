/**
 * Created by pengl on 7/3/2017.
 */

'use strict'

class Message {

    constructor(opt_msg) {
        this.name = this.constructor.name;
        this.message = opt_msg || "Default Message";
    }
}

class ConfigSuccessMessage extends Message{

    constructor(opt_msg, orgInfo) {
        super(opt_msg);

        /** @override */
        this.name = this.constructor.name;
        this.orgInfo = orgInfo;
    }
}

class ConfigFailMessage extends Message{

    constructor(opt_msg, orgInfo) {
        super(opt_msg);

        /** @override */
        this.name = this.constructor.name;
        this.orgInfo = orgInfo;
    }
}

class ConfigMatchedMessage extends Message {

    constructor(opt_msg, orgInfo) {
        super(opt_msg);

        /** @override */
        this.name = this.constructor.name;
        this.orgInfo = orgInfo;
    }
}

class ConfigDismatchMessage extends Message {

    constructor(opt_msg, orgInfo) {
        super(opt_msg);

        /** @override */
        this.name = this.constructor.name;
        this.orgInfo = orgInfo;
    }
}


module.exports = {

    ConfigMatchedMessage: ConfigMatchedMessage,
    ConfigDismatchMessage: ConfigDismatchMessage,
    ConfigSuccessMessage: ConfigSuccessMessage,
    ConfigFailMessage: ConfigFailMessage
}