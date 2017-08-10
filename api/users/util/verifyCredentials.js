'use strict';

const bcrypt    = require('bcrypt');
const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

function verifyCredentials(request, reply) {
    // Find user by email or username
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: 'Users',
        FilterExpression: 'username = :username or email = :username',
        ExpressionAttributeValues: {
            ':username': request.payload.username,
        }
    };

    const onScan = function (err, data) {
        if (err) {
            console.log('verify credentials error:', JSON.stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            if (data.Count === 1) {
                const user = data.Items[0];
                bcrypt.compare(request.payload.password, user.password, function (err, result) {
                    if (err) {
                        console.log('validation password error:', JSON.stringify(err, null, 2));
                        reply(Boom.badImplementation());
                    }

                    console.log(result)
                    // user's password matched!
                    if (result === true) {
                        reply(user);
                    } else {
                        reply(Boom.badRequest('Incorrect password!'));
                    }
                });
            } else {
                // if data.Count = 0 mean no user found
                // if data.Count > 1 mean something went wrong!
                reply(Boom.badRequest('Incorrect username or email!'));
            }

            // continue scanning if we have more users, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != 'undefined') {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    };

    // start scanning...
    docClient.scan(params, onScan);
}

module.exports = verifyCredentials;
