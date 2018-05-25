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

    readingNewRequests(line) {
        var match = line.match(requestPattern);
        if (match !== null) {
            var method = match[1];
            var fullPath = match[2];
            this.currentReq = {
                method: method
            };
            this.currentReq = this.server.parseQueryString(fullPath, this.currentReq);

            if (method === 'POST') {
                this.mode = this.readingBody;
            } else {
                this.server.handle(this.currentReq);
                this.rl.prompt();
            }
        } else {
            this.rl.prompt();
        }
    }

    readingBody(line) {
        var bodyStr = line.trim();
        var data = JSON.parse(bodyStr);
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);

        this.currentReq.headers = {
            'Content-Type': 'application/json',
            'Content-Length': bodyStr.length
        }
        this.currentReq.body = bodyStr

        for (var header in this.currentReq.headers) {
            var headerVal = this.currentReq.headers[header];
            console.log(PROMPT + `${header}: ${headerVal}`);
        }
        console.log(PROMPT);
        console.log(PROMPT + this.currentReq.body);

        this.server.handle(this.currentReq);
        this.rl.prompt();
        this.mode = this.readingNewRequests;
    }
}

exports.Client = Client;
