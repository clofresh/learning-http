const parser = require('./parser');

const PROMPT = 'server: ';

const requestPattern = /^([^ ]*) ([^ ]*) (.*)$/

/**
 * Server is a valid http server that receives line input on recv and returns
 * http responses as strings.
 */
class Server {

    constructor(routes) {
        this.EOF = {};
        this.routes = routes;
        this.mode = this.readingNewRequests;
    }

    recv(line) {
        return this.mode(line);
    }

    readingNewRequests(line) {
        var match = line.match(requestPattern);
        if (match !== null) {
            var method = match[1];
            var fullPath = match[2];
            this.currentReq = {
                method: method,
                headers: {},
                body: ''
            };
            this.currentReq = parser.parsePath(fullPath, this.currentReq);
            this.mode = this.readingHeaders;
        } else {
            return this.EOF;
        }
    }

    readingHeaders(line) {
        line = line.trim();
        if (line === '') {
            if (this.currentReq.method === 'POST') {
                this.mode = this.readingBody;
            } else {
                this.mode = this.readingNewRequests;
                return this.dispatch(this.currentReq);
            }
        } else {
            var sepPos = line.indexOf(':');
            if (sepPos != -1) {
                var key = line.substr(0, sepPos);
                var val = line.substr(sepPos + 1).trim();
                this.currentReq.headers[key] = val;
            } else {
                this.mode = this.readingNewRequests;
                return this.EOF;
            }
        }
    }

    readingBody(line) {
        line = line.trim();
        if (line === '') {
            this.mode = this.readingNewRequests;
            return this.dispatch(this.currentReq);
        } else {
            this.currentReq.body += line;
            if (this.currentReq.body.length >= parseInt(this.currentReq.headers['Content-Length'])) {
                this.mode = this.readingNewRequests;
                return this.dispatch(this.currentReq);
            }
        }
    }

    /**
     * Once an http request has been full parsed, dispatch finds and calls the
     * proper route to handle it based on method and path.
     */
    dispatch(req) {
        var routesByMethod = this.routes[req.method]
        var output = '';
        if (typeof routesByMethod === 'object') {
            var route = routesByMethod[req.path];
            if (typeof route === 'function') {
                try {
                    var response = route(req);
                } catch (err) {
                    var lines = err.stack.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        console.log(`internal: ${lines[i]}`);
                    }
                    output = 'HTTP/1.1 500 Internal Server Error\n';
                }
                if (typeof response === 'string') {
                    output = response;
                } else {
                    console.log(`internal: Expecting a string out from route ${req.method} ${req.path}, received ${typeof response} instead`);
                    output = 'HTTP/1.1 500 Internal Server Error\n';
                }
            } else {
                output = 'HTTP/1.1 404 Not Found\n';
            }
        } else {
            output = 'HTTP/1.1 405 Method Not Allowed\n';
        }
        return output;
    }
}

exports.Server = Server;
