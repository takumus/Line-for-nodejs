'use strict';
exports.__esModule = true;
var LINE = require("../../../libs/");
var TWITTER = require("./twitter");
var Config = require('../config');
var twitter = new TWITTER.Twitter(Config.twitter.consumerKey, Config.twitter.consumerKeySecret);
var line = new LINE.Connector(Config.line.channelSecret, Config.line.channelAccessToken, Config.line.serverPort);
twitter.on('init', function () {
    console.log('twitter is ready');
});
line.on('message', function (message, replyToken, event) {
    var id = event.source.groupId || event.source.roomId || event.source.userId;
    if (!message.text)
        return;
    var split = '';
    var mode = '';
    if (message.text.indexOf('の画像') >= 0) {
        split = 'の画像';
        mode = 'image';
    }
    else if (message.text.indexOf('の動画') >= 0) {
        split = 'の動画';
        mode = 'video';
    }
    else {
        return;
    }
    var query = message.text.split(split);
    if (!query[0])
        return;
    var keyword = query[0];
    var countStr = query[1];
    var count = 1;
    if (countStr) {
        count = convertToNumber(countStr.split('枚')[0]);
        if (count < 0)
            count = 1;
    }
    if (!validate(keyword)) {
        line.push(id, [LINE.create.TextMessage('記号は使えないんだよ？w')]);
        return;
    }
    // ゴリ押しプロミス
    var resolve = function (tweets) {
        count = count < tweets.length ? count : tweets.length;
        line.push(id, [LINE.create.TextMessage("" + keyword + split + "\u898B\u3064\u3051\u305F\uD83D\uDE00")]);
        setTimeout(function () {
            line.push(id, [LINE.create.TextMessage(count + "\u679A\u9001\u308B\u3088\u30FC!\uD83D\uDE0E")]);
        }, 1000);
        var _loop_1 = function (i) {
            var tweet = tweets[i];
            setTimeout(function () {
                if (mode === 'image') {
                    line.push(id, [
                        LINE.create.ImageMessage(tweet.imageURL),
                        LINE.create.TextMessage(tweet.url)
                    ]);
                }
                else {
                    line.push(id, [
                        LINE.create.VideoMessage(tweet.videoURL, tweet.imageURL),
                        LINE.create.TextMessage(tweet.url)
                    ]);
                }
            }, i * 100 + 2000);
        };
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
    };
    var reject = function (e) {
        var message = '';
        if (e == TWITTER.TwitterError.NOT_FOUND) {
            line.push(id, [
                LINE.create.TextMessage("\u300C" + keyword + "\u300D\u306F\u898B\u3064\u304B\u3089\u306A\u3044\u3088\u30FC\uFF01\uD83D\uDE30"),
                LINE.create.ImageMessage(Config.app.notFoundImage)
            ]);
            return;
        }
        else if (e == TWITTER.TwitterError.SERVER_ERROR) {
            message = 'インターナルサーバルエラーだよ！😫';
        }
        else {
            message = "\u5909\u306A\u30A8\u30E9\u30FC\u304C\u51FA\u305F\u3088\uFF01\uD83D\uDE25\u300C" + e + "\u300D";
        }
        line.push(id, [LINE.create.TextMessage(message)]);
    };
    if (mode === 'image') {
        twitter.getImage(keyword).then(resolve)["catch"](reject);
    }
    else {
        twitter.getVideo(keyword).then(resolve)["catch"](reject);
    }
    console.log(keyword + "\u3092" + count + "\u679A");
});
var doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword) {
    for (var i = 0; i < doNotUses.length; i++)
        if (keyword.indexOf(doNotUses[i]) >= 0)
            return false;
    return true;
}
var emNums = ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９'];
function convertToNumber(numStr) {
    var resultStr = '';
    numStr.split('').forEach(function (c) {
        var n = emNums.indexOf(c);
        if (n > -1) {
            resultStr += n.toString();
        }
        else {
            resultStr += c.toString();
        }
    });
    var num = Number(resultStr);
    if (isNaN(num))
        return -1;
    return num;
}
