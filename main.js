'use strict';
const Config = require('./config');
const Line = require('./line').Line;
const fs = require('fs');

const line = new Line(
    Config.channelSecret,//シークレット
    Config.channelAccessToken,//アクセストークン
    Config.httpsPort,//自分のwebhockのhttpsサーバーのポート
    fs.readFileSync(Config.sslKeyPath),//httpsサーバーのkeyファイルのパス
    fs.readFileSync(Config.sslCertPath)//httpsサーバーのcertファイルのパス
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