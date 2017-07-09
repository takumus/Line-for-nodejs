'use strict';

import * as http from 'http';
import { Line, LineData, LineEvent, LineMessage, LineProfile } from '../../../libs/';
import { Twitter } from './twitter';

const Config = require('../config');

const twitter = new Twitter(
    Config.twitter.consumerKey,
    Config.twitter.consumerKeySecret
);

const line = new Line(
    Config.line.channelSecret,
    Config.line.channelAccessToken,
    Config.line.serverPort
);

twitter.on('init', () => {
    console.log('twitter is ready');
});

line.on('message', (message: LineMessage, replyToken: string, event: LineEvent) => {
    const id = event.source.groupId || event.source.userId;
    if (!message.text) return;
    if (message.text.indexOf('の画像') < 0) return;
    const keyword = message.text.split('の画像')[0];
    if (!keyword) return;
    if (!validate(keyword)) {
        line.push(id, [
            {
                type: 'text',
                text: '記号は使えないんだよ？w'
            }
        ]);
        return;
    }

    twitter.getImage(keyword).then((url) => {
        line.push(id, [
            {
                type: 'image',
                originalContentUrl: url,
                previewImageUrl: url
            }
        ]);
    }).catch((e) => {
        line.push(id, [
            {
                type: 'text',
                text: `${keyword}の画像が無かったぞ`
            }
        ]);
    });
    console.log(keyword);
});

const doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword: string): boolean {
    for (let i = 0; i < doNotUses.length; i ++) {
        if (keyword.indexOf(doNotUses[i]) >= 0) return false;
    }
    return true;
}