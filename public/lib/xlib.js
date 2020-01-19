window.xlib = {
    open_socket_io: function (course_id) {
        q = {}
        if (course_id) q = {course_id}
        return io({
            transports: ['websocket'],
            upgrade: false,
            query: q
        });
    },

    send_msg: function (cid, msg) {
        fetch("/api/chat/" + cid, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg
            })
        });
    },

    get_all_msg: function (cid) {
        return fetch("/api/chat/" + cid, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        });
    }
};