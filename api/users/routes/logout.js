'use strict';

module.exports = function (request, reply) {
    // do something when user logout
    
    reply(request.currentUser);
};