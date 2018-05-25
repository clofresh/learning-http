function parsePath(fullPath, req) {
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

exports.parsePath = parsePath;
