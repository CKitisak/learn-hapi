'use strict';

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
            console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            data.Items.forEach(function(user) {
                users.push(user);
            });

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != 'undefined') {
                console.log('Scanning for more...');
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            } else {
                reply(users);
            }
        }
    }

    docClient.scan(params, onScan);
};
