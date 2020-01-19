const ReqWrapper = require('./wrapper/req');
const log = require('debug')('ta:io');
let io;

const conn = exports.conn = {};

exports.setup = function (_io) {
    io = _io;

    io.on('connection', function (socket) {
        const rw = new ReqWrapper(socket.handshake);
        const uid = rw.get_user_id();
        let {course_id} = socket.handshake.query;
        if (!course_id) course_id = 0;
        log('User connected:', 'uid', uid, 'course_id', course_id);

        const connKey = course_id + ':' + uid;
        if (conn[connKey] === undefined) conn[connKey] = {};
        conn[connKey][socket.id] = socket;

        socket.join('course:' + course_id);
        socket.join('user:' + uid);
        socket.on('disconnect', function () {
            log('User disconnected:', 'uid', uid, 'course_id', course_id);
            delete conn[connKey][socket.id];
        });
    });

};

exports.emit_user = function (uid, msg) {
    io.emit('user:' + uid, msg);
};
exports.emit_course = function (cid, msg) {
    io.emit('course:' + cid, msg);
};

exports.get_online_user_in_queue = function (cid) {
    const ret = {};
    for (let [key, value] of Object.entries(conn)) {
        //log(key, value);
        const p = key.split(':');
        if (p[0] != cid || p[1] == 0 || Object.keys(value).length === 0) continue;
        ret[p[1]] = true
    }
    //log(ret);
    return Object.keys(ret);
};