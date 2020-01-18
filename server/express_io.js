const ReqWrapper = require('./wrapper/req');
const log = require('debug')('ta:io');

exports.setup = function (io) {

    io.on('connect', function (socket) {
        const rw = new ReqWrapper(socket.handshake);
        log('User connected ', rw.get_user_id());
        socket.on('disconnect', function () {
            console.log('User disconnected ', rw.get_user_id());
        });
    });

};