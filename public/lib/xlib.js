window.xlib = {
    open_socket_io: function (course_id) {
        q = {}
        if (course_id) q = {course_id}
        return io({
            transports: ['websocket'],
            upgrade: false,
            query: q
        });
    }
};