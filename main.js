#!/usr/bin/env node

const server = require('./server');
const client = require('./client');

const routes = require('./routes');

if (process.argv.length > 2) {
    require('./listener').listen(routes, parseInt(process.argv[2]));
} else {
    var s = new server.Server(routes);
    var c = new client.Client(s);
}
