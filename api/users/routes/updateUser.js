'use strict';

const debug     = require('debug')('API:Users:updateUser');
const Boom      = require('boom');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');

module.exports = function (request, reply) {
    const userId  = request.params.id;
    const payload = request.payload;

    let isFirstExpression         = true;
    let updateExpression          = '';
    let expressionAttributeValues = {};

    // generate expression by payload's properties
    for (let prop in payload) {
        if (isFirstExpression)  {
            isFirstExpression = false;
            updateExpression = 'set ';
        } else {
            updateExpression += ', ';
        }
        updateExpression += (prop + ' = :' + prop);
        expressionAttributeValues[':' + prop] = payload[prop];
    }
    
    debug('updateExpression:', updateExpression);
    debug('expressionAttributeValues:', JSON.stringify(expressionAttributeValues, null, 2));

    // update user by user_id
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Users',
        Key: {
            user_id: userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    };

    docClient.update(params, function (err, data) {
        if (err) {
            debug('updating user error:', JSON.stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            debug('Updated user success!!');
            reply(data.Attributes);
        }
    });
};