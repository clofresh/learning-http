const parser = require('./parser');

const PROMPT = 'server: ';

const requestPattern = /^([^ ]*) ([^ ]*) (.*)$/

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
                return this.handle(this.currentReq);
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
            return this.handle(this.currentReq);
        } else {
            this.currentReq.body += line;
            if (this.currentReq.body.length >= parseInt(this.currentReq.headers['Content-Length'])) {
                this.mode = this.readingNewRequests;
                return this.handle(this.currentReq);
            }
        }
    }

    handle(req) {
        var res = this.dispatch(req);
        var output = [];
        output.push('HTTP/1.1 ' + res.status);
        if (res.headers) {
            for (var key in res.headers) {
                output.push(`${key}: ${res.headers[key]}`)
            }
        }
        output.push('');
        output.push(res.body);
        return output.join('\n');
    }

    dispatch(req) {
        var routesByMethod = this.routes[req.method]
        if (typeof routesByMethod === 'object') {
            var route = routesByMethod[req.path];
            if (typeof route === 'function') {
                var response = route(req);
                if (typeof response === 'object') {
                    return response;
                } else {
                    return {
                        status: '500 Internal Server Error'
                    }
                }
            } else {
                return {
                    status: '404 Not Found'
                }
            }
        } else {
            return {
                status: '405 Method Not Allowed'
            }
        }
    }
}

exports.Server = Server;
