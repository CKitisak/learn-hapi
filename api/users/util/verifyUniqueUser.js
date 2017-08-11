'use strict';

const debug     = require('debug')('API:Users:verifyUniqueUser');
const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

function verifyUniqueUser(request, reply) {
    const userId  = request.params.id;
    const payload = request.payload;
    
    debug('verifyUniqueUser...');
    debug('userId:', JSON.stringify(userId, null, 2));
    debug('payload:', JSON.stringify(payload, null, 2));

    if (payload.email || payload.username) {
        // check username or email is already taken
        AWS.config.update(awsConfig);
        const docClient = new AWS.DynamoDB.DocumentClient();

        let filterExpression = [];
        let expressionAttributeValues = {};
        
        if (payload.email) {
            filterExpression.push('email = :email');
            expressionAttributeValues[':email'] = payload.email;
        }

        if (payload.username) {
            filterExpression.push('username = :username');
            expressionAttributeValues[':username'] = payload.username;
        } 

        const params = {
            TableName: 'Users',
            ProjectionExpression: 'user_id, username, email',
            FilterExpression: filterExpression.join(' or '),
            ExpressionAttributeValues: expressionAttributeValues
        };

        const onScan = function (err, data) {
            if (err) {
                debug('scanning user error:', JSON.stringify(err, null, 2));
                reply(Boom.badImplementation());
            } else {
                if (data.Count === 0) {
                    debug('no matches user, go next step...');
                    reply(payload);
                } else {
                    debug('found some users');
                    data.Items.forEach(function(user) {
                        if (user.user_id === userId) {
                            debug('user itself, go next step...');
                            reply(payload);
                        } else {
                            if (user.username === payload.username) {
                                reply(Boom.badRequest('Username is taken already'));
                            }
                            if (user.email === payload.email) {
                                reply(Boom.badRequest('Email is taken already'));
                            }
                        }
                    });
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
    } else {
        debug('no username or email, verifying skipped...');
        reply(payload);
    }
}

module.exports = verifyUniqueUser;
