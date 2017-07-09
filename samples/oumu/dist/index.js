'use strict';
exports.__esModule = true;
var Config = require('../config');
var LINE = require("../../../libs/");
var line = new LINE.Connector(Config.channelSecret, // シークレット
Config.channelAccessToken, // アクセストークン
Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);
// メッセージが来た時。
line.on('message', function (message, replyToken, event) {
    console.log(event.source.userId);
    line.getProfile(event.source.userId).then(function (profile) {
        console.log(profile);
        message.text += '\nby ' + profile.displayName;
        line.reply(replyToken, [message]);
    })["catch"](function (e) { return console.log(e); });
});
