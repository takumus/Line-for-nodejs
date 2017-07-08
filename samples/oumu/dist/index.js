'use strict';
exports.__esModule = true;
var Config = require('../config');
var _1 = require("../../../libs/");
var line = new _1.Line(Config.channelSecret, // シークレット
Config.channelAccessToken, // アクセストークン
Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);
// なんらかのデータがLINEから来た時
line.on('data', function (e) {
});
// WebhookEvent[]を切り出してイベントを数回呼ばれるように。
line.on('event', function (e) {
});
// メッセージが来た時。
line.on('message', function (message, replyToken, event) {
    console.log(event.source.userId);
    line.getProfile(event.source.userId).then(function (profile) {
        console.log(profile);
        message.text += '\nby ' + profile.displayName;
        line.reply(replyToken, [message]);
    })["catch"](function (e) { return console.log(e); });
});
