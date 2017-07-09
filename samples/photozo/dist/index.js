'use strict';
exports.__esModule = true;
var _1 = require("../../../libs/");
var twitter_1 = require("./twitter");
var Config = require('../config');
var twitter = new twitter_1.Twitter(Config.twitter.consumerKey, Config.twitter.consumerKeySecret);
var line = new _1.Line(Config.line.channelSecret, Config.line.channelAccessToken, Config.line.serverPort);
var working = {};
twitter.on('init', function () {
    console.log('twitter is ready');
});
// メッセージが来た時。
line.on('message', function (message, replyToken, event) {
    var id = event.source.groupId || event.source.userId;
    if (!working[id])
        working[id] = 0;
    if (working[id] > 2) {
        line.push(id, [
            {
                type: 'text',
                text: 'ちょっと待てw'
            }
        ]);
        return;
    }
    if (!message.text)
        return;
    if (message.text.indexOf('の画像') < 0)
        return;
    var keyword = message.text.split('の画像')[0];
    if (!keyword)
        return;
    twitter.getImage(keyword).then(function (url) {
        working[id]--;
        line.push(id, [
            {
                type: 'image',
                originalContentUrl: url,
                previewImageUrl: url
            }
        ]);
    })["catch"](function (e) {
        working[id]--;
        line.push(id, [
            {
                type: 'text',
                text: keyword + "\u306E\u753B\u50CF\u304C\u7121\u304B\u3063\u305F\u305E"
            }
        ]);
    });
    console.log(keyword);
    working[id]++;
});
