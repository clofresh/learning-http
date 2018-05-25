const readline = require('readline');

const PROMPT = 'client: ';

const requestPattern = /^([^ ]*) (.*)$/

class Client {
    constructor(server) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: PROMPT
        });

        this.rl = rl;
        this.server = server;
        this.mode = this.readingNewRequests;
        rl.prompt();
        rl.on('line', function (line) {
            this.mode(line);
        }.bind(this));
    }

    send(line) {
        var resp = this.server.recv(line);
        if (resp === this.server.EOF) {
            this.mode = this.readingNewRequests;
            return false;
        } else if (typeof resp === 'string') {
            var lines = resp.split('\n');
            for (var j = 0; j < lines.length; j++) {
                console.log('server: ' + lines[j]);
            }
        }
        return true;
    }

    readingNewRequests(line) {
        var match = line.match(requestPattern);
        if (match !== null) {
            line += ' HTTP/1.1';
            readline.moveCursor(process.stdout, PROMPT.length, -1);
            console.log(line);
            var method = match[1];
            if (method === 'POST') {
                var ok = this.send(line);
                if (ok) {
                    this.mode = this.readingBody;
                } else {
                    this.rl.prompt();
                }
            } else {
                var vals = [line, ''];
                for (var i = 0; i < vals.length; i++) {
                    var ok = this.send(vals[i]);
                    if (!ok) {
                        break;
                    }
                }
                this.rl.prompt();
            }
        } else {
            this.rl.prompt();
        }
    }

    readingBody(line) {
        line = line.trim();
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);

        var vals = [
            'Content-Type: application/json',
            `Content-Length: ${line.length}`,
            '',
            line,
            ''
        ]
        for (var i = 0; i < vals.length; i++) {
            var val = vals[i];
            console.log(PROMPT + val);
            var ok = this.send(val);
            if (!ok) {
                break;
            }
        }
        this.rl.prompt();
        this.mode = this.readingNewRequests;
    }
}

exports.Client = Client;
