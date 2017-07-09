'use strict';
const Config = require('../config');
import * as LINE from '../../../libs/';

const line = new LINE.Connector(
    Config.channelSecret, // シークレット
    Config.channelAccessToken, // アクセストークン
    Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);

// メッセージが来た時。
line.on('message', (message: LINE.Message, replyToken: string, event: LINE.Event) => {
    line.getProfile(event.source.userId).then((profile: LINE.Profile) => {
        console.log(profile);
        message.text += '\nby ' + profile.displayName;
        line.reply(replyToken, [message]);
    }).catch((e) => console.log(e));
});