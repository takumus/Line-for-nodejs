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
        var message = '';
        if (e == twitter_1.TwitterError.NOT_FOUND) {
            line.push(id, [
                {
                    type: 'text',
                    text: "\u300C" + keyword + "\u300D\u306F\u898B\u3064\u304B\u3089\u306A\u304B\u3063\u305F\u305E\uFF01\uD83D\uDE30"
                },
                {
                    type: 'image',
                    originalContentUrl: Config.app.notFoundImage,
                    previewImageUrl: Config.app.notFoundImage
                }
            ]);
            return;
        }
        else if (e == twitter_1.TwitterError.SERVER_ERROR) {
            message = 'インターナルサーバルエラーだよ！😫';
        }
        else {
            message = "\u5909\u306A\u30A8\u30E9\u30FC\u304C\u51FA\u305F\u3088\uFF01\uD83D\uDE25\u300C" + e + "\u300D";
        }
        line.push(id, [
            {
                type: 'text',
                text: message
            }
        ]);
    });
});
var doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword) {
    for (var i = 0; i < doNotUses.length; i++) {
        if (keyword.indexOf(doNotUses[i]) >= 0)
            return false;
    }
    return true;
}
