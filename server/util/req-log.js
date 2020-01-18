const debug = require('debug');

module.exports = function(name) {
    const log = debug(name);
    return function(req, msg, ...args) {
        log(`[${req.reqid}] `+msg, ...args);
    }
};