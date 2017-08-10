'use strict';

const jwtConfig = require('./config/jwt');

function validate(decoded, request, callback) {
    // validate decoded data...

    // keep decoded token as currentUser(user_id, scope, username)
    // just for try!!
    request.currentUser = decoded;
    return callback(null, true);
}

exports.register = function (server, options, next) {
    server.auth.strategy('jwt', 'jwt', {
        key: jwtConfig.secret,
        validateFunc: validate,
        verifyOptions: {
            algorithms: [jwtConfig.algorithm]
        }
    });

    // apply default auth to all routes
    server.auth.default('jwt');

    next();
};

exports.register.attributes = {
    name: 'JWTAuth',
    version: '1.0.0'
};
