'use strict';
const Config = require('./config');
import { Line, LineData, LineEvent, LineMessage } from '../../../libs/';

const line = new Line(
    Config.channelSecret, // シークレット
    Config.channelAccessToken, // アクセストークン
    Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);

// なんらかのデータがLINEから来た時
line.on('data', (e: LineData) => {
});

// WebhookEvent[]を切り出してイベントを数回呼ばれるように。
line.on('event', (e: LineEvent) => {
});

// メッセージが来た時。
line.on('message', (message: LineMessage, replyToken: string) => {
    // 語尾にfrom nodejsを追加しておうむ返し。
    message.text += '\nfrom nodejs';
    line.reply(replyToken, [message]);
});