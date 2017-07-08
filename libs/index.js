"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var http = require("http");
var https = require("https");
var crypto = require("crypto");
var events_1 = require("events");
exports.API = {
    host: 'api.line.me',
    push_path: '/v2/bot/message/push',
    multicast_path: '/v2/bot/message/multicast',
    reply_path: '/v2/bot/message/reply'
};
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(channelSecret, channelAccessToken, serverPort) {
        var _this = _super.call(this) || this;
        _this.channelSecret = channelSecret;
        _this.channelAccessToken = channelAccessToken;
        _this.serverPort = serverPort;
        _this.init();
        return _this;
    }
    Line.prototype.init = function () {
        var _this = this;
        http.createServer(function (req, res) {
            if (req.method !== 'POST') {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end();
            }
            var body = '';
            req.on('data', function (chunk) { return body += chunk; });
            req.on('end', function () {
                if (body === '')
                    return;
                var signatureA = crypto.createHmac('sha256', _this.channelSecret).update(body).digest('base64');
                var signatureB = req.headers['x-line-signature'];
                if (signatureA !== signatureB)
                    return;
                _this.onData(JSON.parse(body));
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end();
            });
        }).listen(this.serverPort);
    };
    Line.prototype.onData = function (data) {
        var _this = this;
        this.emit('data', data);
        if (data.events) {
            data.events.forEach(function (event, id) {
                _this.onEvent(event, id);
            });
        }
    };
    Line.prototype.onEvent = function (event, id) {
        this.emit('event', event, id);
        if (event.type === 'message') {
            this.onMessage(event.message, event.replyToken, event);
        }
    };
    Line.prototype.onMessage = function (message, replyToken, event) {
        this.emit('message', message, replyToken, event);
    };
    Line.prototype.send = function (path, data) {
        var _this = this;
        var dataStr = JSON.stringify(data);
        return new Promise(function (resolve, reject) {
            var req = https.request({
                host: exports.API.host,
                port: 443,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + _this.channelAccessToken,
                    'Content-Length': Buffer.byteLength(dataStr)
                }
            }, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) { return body += chunk; });
                res.on('end', function () { return resolve(body); });
            });
            req.on('error', function (e) { return reject(e); });
            req.write(dataStr);
            req.end();
        });
    };
    Line.prototype.get = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = https.request({
                host: exports.API.host,
                port: 80,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + _this.channelAccessToken
                }
            }, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) { return body += chunk; });
                res.on('end', function () { return resolve(body); });
            });
            req.on('error', function (e) { return reject(e); });
            req.end();
        });
    };
    Line.prototype.push = function (to, messages) {
        return this.send(exports.API.push_path, {
            to: to,
            'messages': messages
        });
    };
    Line.prototype.multicast = function (to, messages) {
        return this.send(exports.API.multicast_path, {
            to: to,
            'messages': messages
        });
    };
    Line.prototype.reply = function (replyToken, messages) {
        return this.send(exports.API.reply_path, {
            replyToken: replyToken,
            'messages': messages
        });
    };
    return Line;
}(events_1.EventEmitter));
exports.Line = Line;
