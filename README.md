# Web Server

## Overview

This project is a simple, fully functional http server written without any
dependencies that obscure how the http protocol works. I created it because
the current Javascript ecosystem has built up so many abstractions that it's
difficult for new programmers to know what each dependency is doing and why
they need it (or don't need it).

## Usage

To run a mock http repl:

node main.js

To run a real http server:

node main.js 9000

The parameter is the port to listen on. In this case, opening http://localhost:9000/
would hit the server.

## Files

* main.js: entry point
* routes.js: the definition of how to handle urls. This is equivalent to what
you might define with express
* client.js: a command client meant to meant to mimic a real http client. It
displays exactly the data that's sent by the client and received from
the server to get a better picture of how the http protocol works.
* server.js: the http server logic
* listener.js: the code to connect to a tcp port and serve http requests
* parser.js: simple http parsing
