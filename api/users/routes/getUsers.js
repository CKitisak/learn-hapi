'use strict';

const debug     = require('debug')('API:Users:getUsers');
const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

module.exports = function (request, reply) {
    let users = [];

    // get all users from dynamodb...
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Users',
        ProjectionExpression: 'user_id, username, email, admin'
    };

    const onScan = function (err, data) {
        if (err) {
            debug('scanning user error:', JSON.stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            data.Items.forEach(function(user) {
                users.push(user);
            });

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != 'undefined') {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            } else {
                reply(users);
            }
        }
    };

    // start scanning...
    docClient.scan(params, onScan);
};
