# Line-for-nodejs
今のところ自分用。  
ラインBotを簡単に使えるLine.jsです。  

## 機能
・X-Line-Signatureでバリデートしてくれます。（うれしい）  
・依存ライブラリが無い！（いいぞ）  
・簡単！（おおー）  

## 使い方
おうむ返しするコードです。

```js
const Line = require('./line').Line;
const fs = require('fs');

const line = new Line(
    "XXXXXX",                      //シークレット
    "XXXXXX",                      //アクセストークン
    3000,                          //自分のwebhockのhttpsサーバーのポート
    fs.readFileSync("/hoge/hoge"), //httpsサーバーのkeyファイルのパス
    fs.readFileSync("/hoge/hoga")  //httpsサーバーのcertファイルのパス
);

//メッセージが来た時。
line.on('message', (message, replyToken) => {
    //語尾に"\nfrom nodejs"を追加しておうむ返し。
    message.text += "\nfrom nodejs.";
    line.reply(replyToken, [message]);
});

```
とても簡単です！  
## 今のところイベントは３つくらい

### dataイベント
何かをラインから受け取ったらまず一番目に呼ばれます。
↓ページの右側のjsonがオブジェクトとして渡って来ます。
<https://devdocs.line.me/ja/#webhooks>

### eventイベント
２番目以降に呼ばれます。
dataイベントのdata.eventsをforEachしてeventごとに呼んでいます。 
データ構造は↓を参考に。  
<https://devdocs.line.me/ja/#webhook-event-object>    
例えば上のサンプルをeventイベントを使って書くとこうなります。  
```js
//イベントが来た（一度に複数のイベントが来た時は複数回emitします）
line.on('event', (e) => {
    if(e.type === 'message') {
        //語尾に"\nfrom nodejs"を追加しておうむ返し。
        e.message.text += "\nfrom nodejs.";
        line.reply(e.replyToken, [e.message]);
    }
});
```

### messageイベント

メッセージが来たら呼ばれます。  
使いやすいかなと思い、メッセージ、リプライトークン、データ本体を渡しています。
