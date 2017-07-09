'use strict';
exports.__esModule = true;
var Line = require("../../../libs/");
var twitter_1 = require("./twitter");
var Config = require('../config');
var twitter = new twitter_1.Twitter(Config.twitter.consumerKey, Config.twitter.consumerKeySecret);
var line = new Line.Connector(Config.line.channelSecret, Config.line.channelAccessToken, Config.line.serverPort);
twitter.on('init', function () {
    console.log('twitter is ready');
});
line.on('message', function (message, replyToken, event) {
    var id = event.source.groupId || event.source.roomId || event.source.userId;
    if (!message.text || message.text.indexOf('の画像') < 0)
        return;
    var query = message.text.split('の画像');
    if (!query[0])
        return;
    var keyword = query[0];
    var countStr = query[1];
    var count = 1;
    if (countStr) {
        count = Number(countStr.split('枚')[0]);
        if (isNaN(count))
            count = 1;
    }
    if (!validate(keyword)) {
        line.push(id, [Line.create.TextMessage('記号は使えないんだよ？w')]);
        return;
    }
    twitter.getImage(keyword).then(function (tweets) {
        count = count < tweets.length ? count : tweets.length;
        line.push(id, [Line.create.TextMessage(keyword + "\u306E\u753B\u50CF\u898B\u3064\u3051\u305F\uD83D\uDE00")]);
        setTimeout(function () {
            line.push(id, [Line.create.TextMessage(count + "\u679A\u9001\u308B\u3088\u30FC!\uD83D\uDE0E")]);
        }, 1000);
        var _loop_1 = function (i) {
            var tweet = tweets[i];
            setTimeout(function () {
                line.push(id, [Line.create.ImageMessage(tweet.imageURL)]);
            }, i * 100 + 2000);
        };
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
    })["catch"](function (e) {
        var message = '';
        if (e == twitter_1.TwitterError.NOT_FOUND) {
            line.push(id, [
                Line.create.TextMessage("\u300C" + keyword + "\u300D\u306F\u898B\u3064\u304B\u3089\u306A\u3044\u3088\u30FC\uFF01\uD83D\uDE30"),
                Line.create.ImageMessage(Config.app.notFoundImage)
            ]);
            return;
        }
        else if (e == twitter_1.TwitterError.SERVER_ERROR) {
            message = 'インターナルサーバルエラーだよ！😫';
        }
        else {
            message = "\u5909\u306A\u30A8\u30E9\u30FC\u304C\u51FA\u305F\u3088\uFF01\uD83D\uDE25\u300C" + e + "\u300D";
        }
        line.push(id, [Line.create.TextMessage(message)]);
    });
    console.log(keyword + "\u3092" + count + "\u679A");
});
var doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword) {
    for (var i = 0; i < doNotUses.length; i++)
        if (keyword.indexOf(doNotUses[i]) >= 0)
            return false;
    return true;
}
