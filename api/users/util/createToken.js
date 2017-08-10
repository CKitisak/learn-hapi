'use strict';

const jwt       = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt');

function createToken(user) {
    const payload = {
        user_id:  user.user_id,
        username: user.username,
        scope:    user.admin ? 'admin' : 'user'
    };

    const options = {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.expiresIn
    };

    // Sign the JWT
    return jwt.sign(payload, jwtConfig.secret, options);
}

module.exports = createToken;