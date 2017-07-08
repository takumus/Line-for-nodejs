'use strict';
const Config = require('../config');
import { Line, LineData, LineEvent, LineMessage, LineProfile } from '../../../libs/';

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
line.on('message', (message: LineMessage, replyToken: string, event: LineEvent) => {
    console.log(event.source.userId);
    line.getProfile(event.source.userId).then((profile: LineProfile) => {
        console.log(profile);
        message.text += '\nby ' + profile.displayName;
        line.reply(replyToken, [message]);
    }).catch((e) => console.log(e));
});