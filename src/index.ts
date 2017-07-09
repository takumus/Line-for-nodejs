import * as http from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { Data, Event, Message, SendMessage } from './types';
export * from './types';
export const API = {
    host: 'api.line.me',
    push_path: '/v2/bot/message/push',
    multicast_path: '/v2/bot/message/multicast',
    reply_path: '/v2/bot/message/reply',
    profile_path: '/v2/bot/profile'
};
export const create = {
    TextMessage: (message: string) => {
        return {
            type: 'text',
            text: message
        };
    },
    ImageMessage: (url: string) => {
        return {
            type: 'image',
            originalContentUrl: url,
            previewImageUrl: url
        };
    }
};
export class Connector extends EventEmitter {
    private channelSecret: string;
    private channelAccessToken: string;
    private serverPort: number;
    constructor(channelSecret: string, channelAccessToken: string, serverPort: number) {
        super();
        this.channelSecret = channelSecret;
        this.channelAccessToken = channelAccessToken;
        this.serverPort = serverPort;
        this.init();
    }
    private init(): void {
        http.createServer((req, res) => {
            if (req.method !== 'POST') {
                res.writeHead(403, {'Content-Type': 'text/plain'});
                res.end();
            }
            let body = '';
            req.on('data', (chunk) => body += chunk);
            req.on('end', () => {
                if (body === '') return;
                const signatureA = crypto.createHmac('sha256', this.channelSecret).update(body).digest('base64');
                const signatureB = req.headers['x-line-signature'];
                if (signatureA !== signatureB) return;
                this.onData(JSON.parse(body));
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end();
            });

        }).listen(this.serverPort);
    }
    private onData(data: Data) {
        this.emit('data', data);
        if (data.events) {
            data.events.forEach((event, id) => {
                this.onEvent(event, id);
            });
        }
    }
    private onEvent(event: Event, id: number) {
        this.emit('event', event, id);
        if (event.type === 'message') {
            this.onMessage(event.message, event.replyToken, event);
        }
    }
    private onMessage(message: Message, replyToken: string, event: Event) {
        this.emit('message', message, replyToken, event);
    }
    public send(path: string, data: any) {
        const dataStr = JSON.stringify(data);
        return new Promise((resolve, reject) => {
            const req = https.request({
                host: API.host,
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
    public get(path: string) {
        return new Promise<{}>((resolve, reject) => {
            const req = https.request({
                host: API.host,
                port: 443,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.channelAccessToken}`
                }
            }, (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const object = JSON.parse(body);
                        resolve(object);
                        return;
                    }catch (e) {
                        resolve({});
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.end();
        });
    }
    public push(to: string, messages: SendMessage[]) {
        return this.send(API.push_path, {
            to: to,
            'messages': messages
        });
    }
    public multicast(to: string, messages: SendMessage[]) {
        return this.send(API.multicast_path, {
            to: to,
            'messages': messages
        });
    }
    public reply(replyToken: string, messages: SendMessage[]) {
        return this.send(API.reply_path, {
            replyToken: replyToken,
            'messages': messages
        });
    }
    public getProfile(userId: string) {
        return this.get(API.profile_path + '/' + userId);
    }
}