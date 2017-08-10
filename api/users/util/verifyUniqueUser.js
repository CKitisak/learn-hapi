'use strict';

const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

function verifyUniqueUser(request, reply) {
    console.log('verifyUniqueUser:', JSON.stringify(request.payload, null, 2));
    if (request.payload.email || request.payload.username) {
        // check username or email is already taken
        AWS.config.update(awsConfig);
        const docClient = new AWS.DynamoDB.DocumentClient();

        const params = {
            TableName: 'Users',
            ProjectionExpression: 'username, email',
            FilterExpression: 'username = :username or email = :email',
            ExpressionAttributeValues: {
                ':username': request.payload.username,
                ':email': request.payload.email
            }
        };

        const onScan = function (err, data) {
            if (err) {
                console.log('scanning user error:', JSON.stringify(err, null, 2));
                reply(Boom.badImplementation());
            } else {
                console.log('exist users:', JSON.stringify(data, null, 2));
                data.Items.forEach(function(user) {
                    if (user.username === request.payload.username) {
                        reply(Boom.badRequest('Username is taken already'));
                    }
                    if (user.email === request.payload.email) {
                        reply(Boom.badRequest('Email is taken already'));
                    }
                });

                // continue scanning if we have more users, because
                // scan can retrieve a maximum of 1MB of data
                if (typeof data.LastEvaluatedKey != 'undefined') {
                    console.log('Scanning for more...');
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                } else {
                    console.log('this user is not exist');
                    reply(request.payload);
                }
            }
        };
        
        // start scanning...
        docClient.scan(params, onScan);
    } else {
        reply(request.payload);
    }
}

module.exports = verifyUniqueUser;
