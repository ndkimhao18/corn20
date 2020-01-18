const config = require('./config');
const log = require('debug')('db');

const level = require('level');
const AutoIndex = require('level-auto-index');
const sub = require('subleveldown');
const keyReducer = AutoIndex.keyReducer;
const promisify = require('./util/promisify');

const _db = exports._db = level('DATA/main_db');
exports.sub = sub.bind(null, exports._db);

// =====================================

function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function createDb(dbname, indexes) {
    const db = exports[dbname] = sub(_db, dbname, {valueEncoding: 'json'});
    indexes.forEach(v => {
        let keyRed, idxName;
        if (v[0] === '!') {
            const p = v.split('!');
            keyRed = x => x[p[1]] + '#' + x[p[2]];
            idxName = p[1];
        } else {
            keyRed = keyReducer(v);
            idxName = v;
        }
        const by = db['by' + capitalize(idxName)] = AutoIndex(db, sub(db, idxName), keyRed);
        promisify.all(by);
        by.getAll = function (v) {
            return by.createReadStream({start: v, end: v + '~'});
        }
    });
    promisify.all(db);
}

// user_id, full_name, courses: {course_id: <role>}
createDb('users', ['email']);

// course_id, code, title, members: {user_id: <role>}
createDb('courses', ['email']);