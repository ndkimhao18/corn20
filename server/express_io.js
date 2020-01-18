const ReqWrapper = require('./wrapper/req');
const log = require('debug')('ta:io');

exports.setup = function (io) {

    io.on('connection', function (socket) {
        const rw = new ReqWrapper(socket.handshake);
        const uid = rw.get_user_id();
        const {course_id} = socket.handshake.query;
        log('User connected:', 'uid', uid, 'course_id', course_id);

        if (course_id) {
            socket.join('course:' + course_id);
        }
        socket.join('user:' + uid);
        socket.on('disconnect', function () {
            log('User disconnected:', 'uid', uid, 'course_id', course_id);
        });
    });

};