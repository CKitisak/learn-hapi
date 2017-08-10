'use strict';

const createToken = require('../util/createToken');

module.exports = function (request, reply) {
    const result = {
        token: createToken(request.pre.user)
    };

    // maybe can keep token in DB...

    reply(result);
};