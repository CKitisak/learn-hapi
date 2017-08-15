'use strict';

const Glue     = require('glue');
const manifest = require('./config/manifest');

const options  = {
    relativeTo: __dirname
};

Glue.compose(manifest, options, function (err, server) {
    if (err) throw err;
    
    // makes sure that if the script is being required as a
    // module by another script, we don’t start the server
    if (!module.parent) {
        server.start(function (err) {
            if (err) throw err;

            console.log('Server running at: ' + server.info.uri);
        });
    }
});
