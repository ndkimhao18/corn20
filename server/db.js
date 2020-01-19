const config = require('./config');
const log = require('debug')('db');

const level = require('level');
const AutoIndex = require('level-auto-index');
const sub = require('subleveldown');
const keyReducer = AutoIndex.keyReducer;
const promisify = require('./util/promisify');
const utilmisc = require('./util/misc');

const _db = exports._db = level('DATA/main_db');
exports.sub = sub.bind(null, exports._db);

// =====================================

function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function augObj(db) {
    promisify.all(db);
    db.getan = async function (key) {
        try {
            return await db.getAsync(key);
        } catch (e) {
            if (e.type === 'NotFoundError') return null;
            else throw e;
        }
    };
    db.get_all_async = function (v) {
        return utilmisc.streamToObject(db.createReadStream());
    };
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
        const by = db['by_' + idxName] = AutoIndex(db, sub(db, idxName), keyRed);
        augObj(by);
        by.get_all_async = function (v) {
            if (v === undefined) {
                return utilmisc.streamToObject(by.createReadStream());
            }
            return utilmisc.streamToObject(by.createReadStream({start: v + '#', end: v + '#~'}));
        }
    });
    augObj(db);
}

augObj(_db);

// user_id, full_name, courses: {course_id: <role>}
createDb('users', []);

// course_id, code, title, members: {user_id: <role>}
createDb('courses', []);

// course_id:user_id, course_id, user_id, status, createdAt
createDb('tickets', ['user_id', 'assignee']);

// course_id:msg_id, course_id, msg_id, user_id, full_name, msg
createDb('chats', []);