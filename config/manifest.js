'use strict';

function myEnv(key) {
    let config;
    switch (process.env.NODE_ENV) {
        case 'production':
            config = {
                host: process.env.HOST,
                port: process.env.PORT
            };
            break;

        default:
            config = {
                host: 'localhost',
                port: 3000
            };
            break;
    };
    return config[key];
}

const manifest = {
    connections: [
        {
            host: myEnv('host'),
            port: myEnv('port'),
            routes: {
                cors: true
            },
            router: {
                stripTrailingSlash: true
            }
        }
    ],
    registrations: [
        // enabled JWT Auth
        {
            plugin: 'hapi-auth-jwt2'
        },
        {
            plugin: './auth'
        },

        // Apis
        {
            plugin: './api/users'
        },

        // Logging with good, good-console, and good-squeeze
        {
            plugin: {
                register: 'good',
                options: {
                    ops: {
                        interval: 60000
                    },
                    reporters: {
                        console: [
                            {
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{
                                    response: '*',
                                    error: '*'
                                }]
                            },
                            {
                                module: 'good-console'
                            },
                            'stdout'
                        ]
                    }
                }
            }
        }
    ]
};

module.exports = manifest;
