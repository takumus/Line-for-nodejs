'use strict';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as request from 'request';
const Config = require('../config');
import { Line, LineData, LineEvent, LineMessage, LineProfile } from '../../../libs/';

const line = new Line(
    Config.channelSecret, // シークレット
    Config.channelAccessToken, // アクセストークン
    Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);

const working: {[key: string]: number} = {};
// なんらかのデータがLINEから来た時
line.on('data', (e: LineData) => {
});

// WebhookEvent[]を切り出してイベントを数回呼ばれるように。
line.on('event', (e: LineEvent) => {
});

// メッセージが来た時。
line.on('message', (message: LineMessage, replyToken: string, event: LineEvent) => {
    if (!working[event.source.userId]) working[event.source.userId] = 0;
    if (working[event.source.userId] > 2) {
        line.push(event.source.userId, [
            {
                type: 'text',
                text: 'ちょっと待てw'
            }
        ]);
        return;
    }
    line.getProfile(event.source.userId).then((profile: LineProfile) => {
        console.log(profile.displayName + ' -> ' + message.text);
    }).catch((e) => {});
    working[event.source.userId] ++;
    getImageFromPhotozo(message.text).then((fileName) => {
        line.push(event.source.userId, [
            {
                type: 'text',
                text: '画像を見つけたよ!'
            },
            {
                type: 'image',
                originalContentUrl: Config.url + fileName,
                previewImageUrl: Config.url + fileName
            }
        ]).then((r) => {
            // fs.unlink(Config.saveDir + fileName);
        });
        working[event.source.userId]--;
    }).catch((message) => {
        line.push(event.source.userId, [
            {
                type: 'text',
                text: '画像が見つからないぞっ'
            }
        ]);
        working[event.source.userId]--;
    });
});

function getImageFromPhotozo(keyword: string) {
    return new Promise((resolve: (fileName: string) => void, reject: (err: any) => void) => {
        const path = `/rest/search_public.json?keyword=${encodeURIComponent(keyword)}&limit=100&copyright=normal`;
        let canceled = false;
        let finished = false;
        setTimeout(() => {
            if (finished) return;
            canceled = true;
            reject('タイムアウト');
        }, 6000);
        const req = https.request({
            host: 'api.photozou.jp',
            port: 443,
            path: path,
            method: 'GET'
        }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const object = JSON.parse(body);
                    if (object.info.photo_num < 1) {
                         reject('見つからなかった...!');
                         return;
                    }
                    const num = Math.floor(Number(object.info.photo_num) * Math.random());
                    const url = object.info.photo[num]['image_url'];
                    const fileName = crypto.createHash('sha1').update(url).digest('hex') + '.jpg';

                    request(
                        {method: 'GET', url: url, encoding: null},
                        (error, response, body) => {
                            if (!error && response.statusCode === 200) {
                                fs.writeFileSync(Config.saveDir + fileName, body, 'binary');
                                if (!canceled) {
                                    resolve(fileName);
                                    finished = true;
                                }
                            }
                        }
                    );

                    return;
                }catch (e) {
                    reject('謎エラー');
                }
            });
        });
        req.on('error', (e) => console.log(e));
        req.end();
    });
}