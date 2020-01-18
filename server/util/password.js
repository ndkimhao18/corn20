const password = require('password-hash-and-salt');
const util = require('util');

module.exports = {
    hash: (pass) => new Promise((resolve, reject) => {
        password(pass).hash(function (err, hash) {
            if (err) reject(err); else resolve(hash);
        });
    }),
    check: (pass, hash) => new Promise((resolve, reject) => {
        password(pass).verifyAgainst(hash, function (err, verified) {
            if (err) reject(err); else resolve(verified);
        });
    })
};