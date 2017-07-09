'use strict';

import { Line, LineEvent, LineMessage, LineSendMessage } from '../../../libs/';
import { Twitter, TwitterError } from './twitter';

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
    let count: number = 1;
    const countStr = message.text.split('の画像')[1];
    if (countStr) {
        count = Number(countStr.split('枚')[0]);
        if (isNaN(count)) count = 1;
    }
    if (!validate(keyword)) {
        line.push(id, [
            {
                type: 'text',
                text: '記号は使えないんだよ？w'
            }
        ]);
        return;
    }
    twitter.getImage(keyword).then((tweets) => {
        count = count < tweets.length ? count : tweets.length;
        line.push(id, [{
            type: 'text',
            text: `${keyword}の画像${count}枚送るよー!`
        }]);
        for (let i = 0; i < count; i ++) {
            const tweet = tweets[i];
            setTimeout(() => {
                line.push(id, [{
                    type: 'text',
                    text: `${keyword}の画像${i + 1}枚目!`
                },
                {
                    type: 'image',
                    originalContentUrl: tweet.imageURL,
                    previewImageUrl: tweet.imageURL
                }]);
            }, i * 100 + 1000);
        }
    }).catch((e) => {
        let message = '';
        if (e == TwitterError.NOT_FOUND) {
            line.push(id, [
                {
                    type: 'text',
                    text: `「${keyword}」は見つからないよー！😰`
                },
                {
                    type: 'image',
                    originalContentUrl: Config.app.notFoundImage,
                    previewImageUrl: Config.app.notFoundImage
                }
            ]);
            return;
        }else if (e == TwitterError.SERVER_ERROR) {
            message = 'インターナルサーバルエラーだよ！😫';
        }else {
            message = `変なエラーが出たよ！😥「${e}」`;
        }
        line.push(id, [
            {
                type: 'text',
                text: message
            }
        ]);
    });
});

const doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword: string): boolean {
    for (let i = 0; i < doNotUses.length; i ++) {
        if (keyword.indexOf(doNotUses[i]) >= 0) return false;
    }
    return true;
}