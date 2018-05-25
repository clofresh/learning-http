const net = require('net');
const Server = require('./server').Server;

function listen(routes, port) {
    var clients = {};
    var listener = net.createServer(function (socket) {
        socket.setEncoding('utf-8');
        clients[socket.localPort] = {
            socket: socket,
            server: new Server(routes)
        };

        socket.on('data', function (data) {
            var lines = data.split('\r\n');
            var server = clients[socket.localPort].server;
            for (var j = 0; j < lines.length; j++) {
                console.log(lines[j]);
                var buf = server.recv(lines[j]);
                if (buf === server.EOF) {
                    socket.end();
                } else if (typeof buf === 'string') {
                    socket.write(buf);
                }
            }
        });
        socket.on('end', function () {
            clients[socket.localPort] = null;
            socket.end();
        });
    });
    console.log(`listening on http://localhost:${port}`);
    listener.listen(port);
}

exports.listen = listen;
