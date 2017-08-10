'use strict';

const Joi = require('joi');

const loginSchema = Joi.object({
    // username or email
    username: Joi.alternatives().try(
        Joi.string().email().required(),
        Joi.string().regex(/^\w{3,30}$/).required()
    ),
    // strong password
    password: Joi.string().regex(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/).required()
});

module.exports = loginSchema;
