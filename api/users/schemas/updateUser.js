'use strict';

const Joi = require('joi');

const payloadSchema = Joi.object({
    username: Joi.string().regex(/^\w{3,30}$/),
    email: Joi.string().email(),
    admin: Joi.boolean()
});

const paramsSchema = Joi.object({
    id: Joi.string().required()
});

module.exports = {
    payloadSchema: payloadSchema,
    paramsSchema: paramsSchema
};
