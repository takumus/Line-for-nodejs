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
## 今のところメソッドは３つくらい

### push
１人に対してメッセージを送ります。  
```js
line.push(送り先, [メッセージオブジェクト,...]);
```
### multicast
複数人に対してメッセージを送ります。  
```js
line.multicast([送り先,...], [メッセージオブジェクト,...]);
```
### reply
リプライトークンを使ってリプライを送ります。  
```js
line.reply(リプライトークン, [メッセージオブジェクト,...]);
```
### send
データを送れます。  
```js
line.send(APIのpath, 送るデータ)
```
まだ上の３つしかメソッドがないので、それ以外の方法で送りたい場合はapi pathとデータを使えば送れます。  
上の３メソッドはこのsendメソッドを使って実装されます。

## 今のところイベントは３つくらい

解説が下手なのでソースを見てください！読めると思います。  

### dataイベント
何かをラインから受け取ったらまず一番目に呼ばれます。  
↓ページの右側のjsonがオブジェクトとして渡って来ます。  
<https://devdocs.line.me/ja/#webhooks>  
例えば上のサンプルをdataイベントを使って書くとこうなります。  
```js
line.on('data', (d) => {
    if (d.events) {
        d.events.forEach((event) => {
            if(e.type === 'message') {
                //語尾に"\nfrom nodejs"を追加しておうむ返し。
                e.message.text += "\nfrom nodejs.";
                line.reply(e.replyToken, [e.message]);
            }
        });
    }
});
```

### eventイベント
２番目以降に呼ばれます。  
dataイベントのdata.eventsをforEachしてeventごとに呼んでいます。 
データ構造は↓を参考に。  
<https://devdocs.line.me/ja/#webhook-event-object>  
例えば上のサンプルをeventイベントを使って書くとこうなります。  
```js
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
サンプルでも使っています。  
```js
line.on('message', (message, replyToken) => {
    //語尾に"\nfrom nodejs"を追加しておうむ返し。
    message.text += "\nfrom nodejs.";
    line.reply(replyToken, [message]);
});
```