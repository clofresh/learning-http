#!/usr/bin/env node

const server = require('./server');
const client = require('./client');

const routes = require('./routes');

var s = new server.Server(routes);
var c = new client.Client(s);

// require('./listener').listen(routes, 8080);
