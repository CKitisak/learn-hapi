'use strict';

const Glue     = require('glue');
const manifest = require('./config/manifest');

const options  = {
    relativeTo: __dirname
};

Glue.compose(manifest, options, function (err, server) {
    if (err) throw err;
    
    server.start(function (err) {
        if (err) throw err;

        console.log('Server running at: ' + server.info.uri);
    });
});
