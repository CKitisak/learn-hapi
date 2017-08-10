'use strict';

const Joi = require('joi');

const createUserSchema = Joi.object({
    // alphanum and underscore
    username: Joi.string().regex(/^\w{3,30}$/).required(),
    // strong password
    password: Joi.string().regex(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/).required(),
    email: Joi.string().email().required()
});

module.exports = createUserSchema;