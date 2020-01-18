exports.setup = function (app) {
    app.use('/api/user', require('./api/user'));
    app.use('/api/canvas', require('./api/canvas'));
    app.use('/api/db', require('./api/db'));

    app.use('/', require('./public_controller/user_generic'));
};