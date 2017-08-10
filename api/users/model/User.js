'use strict';

const ObjectModel = require('objectmodel').ObjectModel;

const User = new ObjectModel({
    user_id: String,
    username: /^\w{3,30}$/,
    password: /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
    email: /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i,
    admin: Boolean
});

module.exports = User;