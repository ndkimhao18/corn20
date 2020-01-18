exports.setup = function (app) {
    app.use('/api/user', require('./api/user'));

    app.use('/', require('./public_controller/user_generic'));
};
