'use strict';

const debug     = require('debug')('API:Users:createUsers');
const bcrypt    = require('bcrypt');
const Boom      = require('boom');
const uuid      = require('uuid');
const AWS       = require('aws-sdk');
const awsConfig = require('../../../config/aws');
const User      = require('../model/User');

module.exports = function (request, reply) {
    const payload = request.payload;

    // hashing password with salt at level 10 strength
    bcrypt.hash(payload.password, 10, function (err, hash) {
        if (err) {
            debug('hashing password error:', JSON,stringify(err, null, 2));
            reply(Boom.badImplementation());
        } else {
            // add new user into dynamodb...
            AWS.config.update(awsConfig);
            const docClient = new AWS.DynamoDB.DocumentClient();

            const newUser = new User({
                user_id: uuid.v4(),
                username: payload.username,
                password: hash,
                email: payload.email,
                admin: false
            });
    
            const params = {
                TableName: 'Users',
                Item: newUser
            };
            
            docClient.put(params, function (err, data) {
                if (err) {
                    debug('adding user error:', JSON.stringify(err, null, 2));
                    reply(Boom.badImplementation());
                } else {
                    debug('Added user success!!');
                    reply({ userId: newUser.user_id });
                }
            });
        }
    });
};