'use strict';
exports.__esModule = true;
var _1 = require("../../../libs/");
var twitter_1 = require("./twitter");
var Config = require('../config');
var twitter = new twitter_1.Twitter(Config.twitter.consumerKey, Config.twitter.consumerKeySecret);
var line = new _1.Line(Config.line.channelSecret, Config.line.channelAccessToken, Config.line.serverPort);
twitter.on('init', function () {
    console.log('twitter is ready');
});
line.on('message', function (message, replyToken, event) {
    var id = event.source.groupId || event.source.userId;
    if (!message.text)
        return;
    if (message.text.indexOf('の画像') < 0)
        return;
    var keyword = message.text.split('の画像')[0];
    if (!keyword)
        return;
    if (!validate(keyword)) {
        line.push(id, [
            {
                type: 'text',
                text: '記号は使えないんだよ？w'
            }
        ]);
        return;
    }
    twitter.getImage(keyword).then(function (url) {
        line.push(id, [
            {
                type: 'text',
                text: keyword + "\u306E\u753B\u50CF\u3060\u3088...!"
            },
            {
                type: 'image',
                originalContentUrl: url,
                previewImageUrl: url
            }
        ]);
    })["catch"](function (e) {
        line.push(id, [
            {
                type: 'text',
                text: keyword + "\u306E\u753B\u50CF\u304C\u7121\u304B\u3063\u305F\u305Ew"
            }
        ]);
    });
    console.log(keyword);
});
var doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword) {
    for (var i = 0; i < doNotUses.length; i++) {
        if (keyword.indexOf(doNotUses[i]) >= 0)
            return false;
    }
    return true;
}
