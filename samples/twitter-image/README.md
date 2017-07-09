# ラインでツイッターの画像を検索して返す
ラインでツイッターの画像を検索して返すやつです！  
Line部分はおうむ返しとほぼ同じですが今回はTwitterから画像撮って来る作業があるので、  
やや面倒です。  

## Twitter Application Only Authentication
今回はこれを使います。  
Twitterログインをしてアクセストークンを取得して...とかをやらないで使えるAPIです。  
consumerKeyとconsumerKeySecretだけで使えます。  
今回はsearchが使えればよかったのでこれでOK。  
その辺は`src/twitter.ts`としてまとめてあります。  
参考：<https://github.com/m-coding/twitter-application-only-auth>

## こんな感じ
<img src="https://raw.githubusercontent.com/takumus/Line-for-nodejs/master/samples/twitter-image/sample.png" width="320px">
