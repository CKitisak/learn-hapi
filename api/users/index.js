'use strict';

const createUser        = require('./routes/createUser');
const createUserSchema  = require('./schemas/createUser');
const updateUser        = require('./routes/updateUser');
const updateUserSchema  = require('./schemas/updateUser');
const deleteUser        = require('./routes/deleteUser');
const deleteUserSchema  = require('./schemas/deleteUser');
const login             = require('./routes/login');
const loginSchema       = require('./schemas/login');
const logout            = require('./routes/logout');
const getUsers          = require('./routes/getUsers');
const verifyCredentials = require('./util/verifyCredentials');
const verifyUniqueUser  = require('./util/verifyUniqueUser');

exports.register = function (server, options, next) {
    server.route([
        {
            path: '/api/users',
            method: 'GET',
            config: {
                auth: {
                    scope: ['admin']    // available only admin
                },
                handler: getUsers
            }
        },
        {
            path: '/api/users',
            method: 'POST',
            config: {
                // ignore JWT checking
                auth: false,
                handler: createUser,
                pre: [
                    // Check the username and email
                    { method: verifyUniqueUser }
                ],
                validate: {
                    // Validate the payload with Joi schema
                    payload: createUserSchema
                }
            }
        },
        {
            path: '/api/users/{id}',
            method: ['PATCH', 'PUT'],
            config: {
                handler: updateUser,
                pre: [
                    // Check the username and email
                    { method: verifyUniqueUser, assign: 'user' }
                ],
                validate: {
                    // Validate the payload and params
                    params: updateUserSchema.paramsSchema,
                    payload: updateUserSchema.payloadSchema
                }
            }
        },
        {
            path: '/api/users/{id}',
            method: 'DELETE',
            config: {
                handler: deleteUser,
                validate: {
                    // Validate the params
                    params: deleteUserSchema 
                }
            }
        },
        {
            path: '/api/users/login',
            method: 'POST',
            config: {
                // ignore JWT checking
                auth: false,
                handler: login,
                pre: [
                    // Check the password
                    { method: verifyCredentials, assign: 'user' }
                ],
                validate: {
                    // Validate the payload with Joi schema
                    payload: loginSchema
                }
            }
        },
        {
            path: '/api/users/logout',
            method: 'GET',
            handler: logout
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'UsersApi',
    version: '1.0.0'
};
