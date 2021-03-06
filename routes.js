const routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
};

routes.GET['/'] = function (req) {
    var body = `<html>
<body>
    <p>Hello <a href="/world?foo=bar">world</a></p>
</body>
</html>`;
    return formatResponse({
        status: '200 OK',
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': body.length,
        },
        body: body
    });
}

routes.GET['/world'] = function (req) {
    var foo = req.queryString.foo;
    if (foo === undefined) {
        status = '400 Bad Request';
    } else {
        status = '200 OK';
    }

    var body = `<html>
<body>
    <p>The world is foo. But foo is ${foo}</p>
    <p>What about <a href="/api/gimme">api calls?</a></p>
</body>
</html>`

    return formatResponse({
        status: status,
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': body.length,
        },
        body: body
    });
}

var gimmeData = []
routes.GET['/api/gimme'] = function (req) {
    var responseData = {
        here: 'is some data. Add more with POST /api/gimme',
        data: gimmeData
    };
    var body = JSON.stringify(responseData, null, 2);
    return formatResponse({
        status: '200 OK',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
        },
        body: body
    });
}

routes.POST['/api/gimme'] = function (req) {
    var contentType = req.headers['Content-Type']
    if (contentType === 'application/json') {
        var length = parseInt(req.headers['Content-Length']);
        var body = req.body.substring(0, length)
        try {
            var bodyObj = JSON.parse(body);
        } catch (err) {
            var responseBody = `Invalid json: ${body}`;
            return formatResponse({
                status: '400 Bad Request',
                headers: {
                    'Content-Type': 'text/plain',
                    'Content-Length': responseBody.length,
                },
                body: responseBody
            });
        }
        gimmeData.push(bodyObj);
        return formatResponse({
            status: '200 OK',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': 0,
            }
        });
    } else {
        var responseBody = JSON.stringify({
            error: `Unknown Content-Type: ${contentType}`
        })
        return formatResponse({
            status: '400 Bad Request',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': responseBody.length,
            },
            body: responseBody
        });
    }
}

/** Helper function to format an object into a valid http response string */
function formatResponse(res) {
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

for (var method in routes) {
    exports[method] = routes[method];
}
