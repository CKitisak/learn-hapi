'use strict';

const Boom = require('boom');
const AWS = require('aws-sdk');
const awsConfig = require('../../../config/aws');

module.exports = function (request, reply) {
    const userId = request.params.id;
    const payload = request.payload;

    let isFirstExpression = true;
    let updateExpression = '';
    let expressionAttributeValues = {};

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
    
    console.log('--------\n\n' + updateExpression + '\n\n--------');
    console.log(JSON.stringify(expressionAttributeValues, null, 2));

    // add new user into dynamodb...
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Users',
        Key: {
            user_id: userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        // ReturnValues: 'UPDATED_NEW'
    };

    docClient.update(params, function (err, data) {
        if (err) {
            console.log('updating user error:', JSON.stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            console.log('Updated user success!!');
            reply(data);
        }
    });
};