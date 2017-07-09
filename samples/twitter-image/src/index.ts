'use strict';

import * as LINE from '../../../libs/';
import { Twitter, TwitterError } from './twitter';

const Config = require('../config');

const twitter = new Twitter(
    Config.twitter.consumerKey,
    Config.twitter.consumerKeySecret
);

const line = new LINE.Connector(
    Config.line.channelSecret,
    Config.line.channelAccessToken,
    Config.line.serverPort
);

twitter.on('init', () => {
    console.log('twitter is ready');
});

line.on('message', (message: LINE.Message, replyToken: string, event: LINE.Event) => {
    const id = event.source.groupId || event.source.roomId || event.source.userId;
    if (!message.text || message.text.indexOf('の画像') < 0) return;
    const query = message.text.split('の画像');
    if (!query[0]) return;
    const keyword = query[0];
    const countStr = query[1];
    let count: number = 1;
    if (countStr) {
        count = convertToNumber(countStr.split('枚')[0]);
        if (count < 0) count = 1;
    }
    if (!validate(keyword)) {
        line.push(id, [LINE.create.TextMessage('記号は使えないんだよ？w')]);
        return;
    }
    twitter.getImage(keyword).then((tweets) => {
        count = count < tweets.length ? count : tweets.length;
        line.push(id, [LINE.create.TextMessage(`${keyword}の画像見つけた😀`)]);
        setTimeout(() => {
            line.push(id, [LINE.create.TextMessage(`${count}枚送るよー!😎`)]);
        }, 1000);
        for (let i = 0; i < count; i ++) {
            const tweet = tweets[i];
            setTimeout(() => {
                line.push(id, [LINE.create.ImageMessage(tweet.imageURL)]);
            }, i * 100 + 2000);
        }
    }).catch((e) => {
        let message = '';
        if (e == TwitterError.NOT_FOUND) {
            line.push(id, [
                LINE.create.TextMessage(`「${keyword}」は見つからないよー！😰`),
                LINE.create.ImageMessage(Config.app.notFoundImage)
            ]);
            return;
        }else if (e == TwitterError.SERVER_ERROR) {
            message = 'インターナルサーバルエラーだよ！😫';
        }else {
            message = `変なエラーが出たよ！😥「${e}」`;
        }
        line.push(id, [LINE.create.TextMessage(message)]);
    });
    console.log(`${keyword}を${count}枚`);
});

const doNotUses = ['"', "'", '/', '\\', '<', '>', '`', '?'];
function validate(keyword: string): boolean {
    for (let i = 0; i < doNotUses.length; i ++) if (keyword.indexOf(doNotUses[i]) >= 0) return false;
    return true;
}

const emNums = ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９'];
function convertToNumber(numStr: string) {
    let resultStr = '';
    numStr.split('').forEach((c) => {
        const n = emNums.indexOf(c);
        if (n > -1) {
            resultStr += n.toString();
        }else {
            resultStr += c.toString();
        }
    });
    const num = Number(resultStr);
    if (isNaN(num)) return -1;
    return num;
}