'use strict';

const debug     = require('debug')('API:Users:deleteUser');
const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

module.exports = function (request, reply) {
    const userId  = request.params.id;

    // delete user by user_id
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Users',
        Key: {
            user_id: userId
        }
    };

    docClient.delete(params, function (err, data) {
        if (err) {
            debug('deleting user error:', JSON.stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            debug('Deleted user success!!');
            reply({ success: true });
        }
    });
};