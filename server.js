const PROMPT = 'server: ';

class Server {
    constructor(routes) {
        this.routes = routes
    }

    handle(req) {
        var res = dispatch(req, this.routes);
        send(res.status);
        if (res.headers) {
            for (var key in res.headers) {
                send(`${key}: ${res.headers[key]}`)
            }
        }
        send();
        if (res.body) {
            send(res.body);
            send();
        }
    }

    parseQueryString(fullPath, req) {
        var path = '';
        var queryString = {}
        for (var i = 0; i < fullPath.length; i++) {
            var char = fullPath[i];
            if (char === '?') {
                var varName = '';
                var val = '';
                var mode = 'name';
                for (var j = i + 1; j < fullPath.length; j++) {
                    char = fullPath[j];
                    if (mode === 'name') {
                        if (char === '=') {
                            mode = 'val';
                        } else if (char === '&') {
                            queryString[varName] = '';
                            varName = '';
                        } else {
                            varName += char;
                        }
                    } else if (mode === 'val') {
                        if (char === '&') {
                            mode = 'name';
                            queryString[varName] = val;
                            varName = ''
                            val = ''
                        } else {
                            val += char;
                        }
                    }
                }
                if (varName.length > 0) {
                    queryString[varName] = val;
                }
                break;
            } else if (char === '#') {
                break;
            } else {
                path += char;
            }
        }
        req.path = path;
        req.queryString = queryString;
        return req;
    }
}

function dispatch(req, routes) {
    var routesByMethod = routes[req.method]
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

function send(str) {
    if (typeof str === 'null' || typeof str == 'undefined') {
        str = ''
    }
    str = str.trim()
    var lines = str.split('\n')
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        console.log(PROMPT + line);
    }
}

exports.Server = Server;
