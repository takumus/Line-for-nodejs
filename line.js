const api = {
    host: 'api.line.me',
    push_path: '/v2/bot/message/push',
    multicast_path: '/v2/bot/message/multicast',
    reply_path: '/v2/bot/message/reply'
}

const https = require('https');
const crypto = require('crypto');
const EventEmitter = require('events').EventEmitter;

class Line extends EventEmitter{
    constructor(channelSecret, channelAccessToken, httpsPort, sslKey, sslCert) {
        super();
        this.channelSecret = channelSecret;
        this.channelAccessToken = channelAccessToken;
        this.httpsPort = httpsPort;
        this.sslKey = sslKey;
        this.sslCert = sslCert;
        this._init();
    }
    _init() {
        https.createServer({
            key: this.sslKey,
            cert: this.sslCert
        }, (req, res) => {    
            if(req.method !== 'POST'){
                res.writeHead(403, {'Content-Type': 'text/plain'});
                res.end();
            }
            let body = '';
            req.on('data', (chunk) => body += chunk);        
            req.on('end', () => {
                if(body === '') return;
                const signatureA = crypto.createHmac('sha256', this.channelSecret).update(body).digest('base64');
                const signatureB = req.headers['x-line-signature'];
                if (signatureA !== signatureB) return;
                this._onData(JSON.parse(body));
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end();
            });

        }).listen(this.httpsPort);
    }
    _onData(data) {
        this.emit('data', data);
        if (data.events) {
            data.events.forEach((event, id) => {
                this._onEvent(event, id);
            });
        }
    }
    _onEvent(event, id) {
        this.emit('event', event, id);
        if (event.type === 'message') {
            this._onMessage(event.message, event.replyToken, event);
        }
    }
    _onMessage(message, replyToken, event) {
        this.emit('message', message, replyToken, event);
    }

    send(path, data) { 
        let dataStr = JSON.stringify(data);
        return new Promise((resolve, reject) => {
            const req = https.request({
                host: api.host,
                port: 443,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${this.channelAccessToken}`,
                    'Content-Length': Buffer.byteLength(dataStr)
                }
            }, (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve(body));
            });
            req.on('error', (e) => reject(e));
            req.write(dataStr);
            req.end();
        });
    }
    push(to, messages) {
        return this.send(api.push_path, {
            to: to,
            'messages': messages
        })
    }
    multicast(to, messages) {
        return this.send(api.multicast_path, {
            to: to,
            'messages': messages
        })
    }
    reply(replyToken, messages) {
        return this.send(api.reply_path, {
            replyToken: replyToken,
            'messages': messages
        })
    }
}
module.exports = {
    Line: Line,
    api: api
}