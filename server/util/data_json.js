const config = require('../config');
const path = require('path');
const fs = require('fs');

(() => {
    const files = fs.readdirSync(config.datajsondir);
    files.forEach(f => {
        const dbname = path.basename(f).replace('.json', '');
        exports[dbname] = JSON.parse(fs.readFileSync(config.datajsondir + f).toString('utf8'));
    });
})();