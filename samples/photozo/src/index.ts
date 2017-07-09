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

const working: {[key: string]: number} = {};

twitter.on('init', () => {
    console.log('twitter is ready');
});

line.on('message', (message: LineMessage, replyToken: string, event: LineEvent) => {
    const id = event.source.groupId || event.source.userId;
    if (!working[id]) working[id] = 0;
    if (working[id] > 2) {
        line.push(id, [
            {
                type: 'text',
                text: 'ちょっと待てw'
            }
        ]);
        return;
    }
    if (!message.text) return;
    if (message.text.indexOf('の画像') < 0) return;
    const keyword = message.text.split('の画像')[0];
    if (!keyword) return;

    twitter.getImage(keyword).then((url) => {
        working[id] --;
        line.push(id, [
            {
                type: 'image',
                originalContentUrl: url,
                previewImageUrl: url
            }
        ]);
    }).catch((e) => {
        working[id] --;
        line.push(id, [
            {
                type: 'text',
                text: `${keyword}の画像が無かったぞ`
            }
        ]);
    });
    console.log(keyword);
    working[id] ++;
});