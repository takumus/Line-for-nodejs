'use strict';
exports.__esModule = true;
var https = require("https");
var fs = require("fs");
var crypto = require("crypto");
var request = require("request");
var Config = require('../config');
var _1 = require("../../../libs/");
var line = new _1.Line(Config.channelSecret, // シークレット
Config.channelAccessToken, // アクセストークン
Config.serverPort // 自分のwebhockのhttpsサーバーのポート
);
var working = {};
// なんらかのデータがLINEから来た時
line.on('data', function (e) {
});
// WebhookEvent[]を切り出してイベントを数回呼ばれるように。
line.on('event', function (e) {
});
// メッセージが来た時。
line.on('message', function (message, replyToken, event) {
    if (!working[event.source.userId])
        working[event.source.userId] = 0;
    if (working[event.source.userId] > 2) {
        line.push(event.source.userId, [
            {
                type: 'text',
                text: 'ちょっと待てw'
            }
        ]);
        return;
    }
    line.getProfile(event.source.userId).then(function (profile) {
        console.log(profile.displayName + ' -> ' + message.text);
    })["catch"](function (e) { });
    working[event.source.userId]++;
    getImageFromPhotozo(message.text).then(function (fileName) {
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
        ]).then(function (r) {
            // fs.unlink(Config.saveDir + fileName);
        });
        working[event.source.userId]--;
    })["catch"](function (message) {
        line.push(event.source.userId, [
            {
                type: 'text',
                text: '画像が見つからないぞっ'
            }
        ]);
        working[event.source.userId]--;
    });
});
function getImageFromPhotozo(keyword) {
    return new Promise(function (resolve, reject) {
        var path = "/rest/search_public.json?keyword=" + encodeURIComponent(keyword) + "&limit=100&copyright=normal";
        var canceled = false;
        var finished = false;
        setTimeout(function () {
            if (finished)
                return;
            canceled = true;
            reject('タイムアウト');
        }, 6000);
        var req = https.request({
            host: 'api.photozou.jp',
            port: 443,
            path: path,
            method: 'GET'
        }, function (res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) { return body += chunk; });
            res.on('end', function () {
                try {
                    var object = JSON.parse(body);
                    if (object.info.photo_num < 1) {
                        reject('見つからなかった...!');
                        return;
                    }
                    var num = Math.floor(Number(object.info.photo_num) * Math.random());
                    var url = object.info.photo[num]['image_url'];
                    var fileName_1 = crypto.createHash('sha1').update(url).digest('hex') + '.jpg';
                    request({ method: 'GET', url: url, encoding: null }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            fs.writeFileSync(Config.saveDir + fileName_1, body, 'binary');
                            if (!canceled) {
                                resolve(fileName_1);
                                finished = true;
                            }
                        }
                    });
                    return;
                }
                catch (e) {
                    reject('謎エラー');
                }
            });
        });
        req.on('error', function (e) { return console.log(e); });
        req.end();
    });
}
