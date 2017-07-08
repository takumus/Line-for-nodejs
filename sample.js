'use strict';
const Config = require('./config');
const Line = require('./line/').Line;

const line = new Line(
    Config.channelSecret,//シークレット
    Config.channelAccessToken,//アクセストークン
    Config.serverPort//自分のwebhockのhttpsサーバーのポート
);

//なんらかのデータがLINEから来た時
line.on('data', (e) => {
});

//WebhookEvent[]を切り出してイベントを数回呼ばれるように。
line.on('event', (e) => {
});

//メッセージが来た時。
line.on('message', (message, replyToken) => {
    //語尾にfrom nodejsを追加しておうむ返し。
    message.text += "\nfrom nodejs.";
    line.reply(replyToken, [message]);
})