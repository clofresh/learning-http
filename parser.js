/** Parse a url path and populate the path and queryString keys of the req object */
function parsePath(fullPath, req) {
    var path = '';
    var queryString = {}
    for (var i = 0; i < fullPath.length; i++) {
        var char = fullPath[i];
        if (char === '?') {
            // If you see a ?, start parsing for a query string
            queryString = parseQueryString(fullPath, i + 1);
            break;
        } else if (char === '#') {
            // If you see a # you can ignore the rest of the path going forward
            break;
        } else {
            // Accumulate the path
            path += char;
        }
    }
    req.path = path;
    req.queryString = queryString;
    return req;
}

/** Given a path string and the position after the ? return an object of query params */
function parseQueryString(str, startPos) {
    var queryString = {};
    var varName = '';
    var val = '';
    var mode = 'name';
    for (var i = startPos; i < str.length; i++) {
        var char = str[i];
        if (mode === 'name') {
            // Parsing the name of the query var
            if (char === '=') {
                mode = 'val';
            } else if (char === '&') {
                queryString[varName] = '';
                varName = '';
            } else {
                varName += char;
            }

        } else if (mode === 'val') {
            // Parsing the value of the query var
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
    return queryString
}

exports.parsePath = parsePath;
