"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var request = require("request");
var events_1 = require("events");
var Twitter = (function (_super) {
    __extends(Twitter, _super);
    function Twitter(consumerKey, consumerKeySecret) {
        var _this = _super.call(this) || this;
        var options = {
            url: 'https://api.twitter.com/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + new Buffer(consumerKey + ':' + consumerKeySecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: 'grant_type=client_credentials'
        };
        request.post(options, function (error, response, body) {
            if (error)
                return;
            _this.accessToken = JSON.parse(body)['access_token'];
            _this.emit('init', _this.accessToken);
        });
        return _this;
    }
    Twitter.prototype.get = function (options) {
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    reject(TwitterError.SERVER_ERROR);
                    return;
                }
                try {
                    resolve(eval(body));
                }
                catch (e) {
                    reject(TwitterError.UNKNOWN_ERROR_1);
                }
            });
        });
    };
    Twitter.prototype.getImage = function (keyword) {
        var _this = this;
        var options = {
            method: 'GET',
            json: true,
            url: 'https://api.twitter.com/1.1/search/tweets.json',
            qs: {
                'q': keyword + " filter:images min_retweets:1 exclude:retweets",
                'lang': 'ja',
                'count': 100,
                'result_type': 'recent'
            },
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            }
        };
        return new Promise(function (resolve, reject) {
            _this.get(options).then(function (data) {
                try {
                    var statuses = data.statuses;
                    if (statuses.length == 0) {
                        reject(TwitterError.NOT_FOUND);
                        return;
                    }
                    var mediaURLs_1 = [];
                    statuses.forEach(function (t) {
                        var media = (t.extended_entities && t.extended_entities.media) ? t.extended_entities.media : t.entities.media;
                        if (media && media.length > 0) {
                            media.forEach(function (m) {
                                var url = m.media_url_https;
                                if (url) {
                                    var tweet = {
                                        imageURL: url,
                                        url: 'https://twitter.com/statuses/' + t.id_str
                                    };
                                    mediaURLs_1.push(tweet);
                                }
                            });
                        }
                    });
                    if (mediaURLs_1.length > 0) {
                        resolve(mediaURLs_1);
                    }
                    else {
                        reject(TwitterError.NOT_FOUND);
                    }
                    return;
                }
                catch (e) {
                    console.log(e);
                    reject(TwitterError.UNKNOWN_ERROR_1);
                    return;
                }
            })["catch"](function (e) {
                reject(e);
            });
        });
    };
    Twitter.prototype.getVideo = function (keyword) {
        var _this = this;
        var options = {
            method: 'GET',
            json: true,
            url: 'https://api.twitter.com/1.1/search/tweets.json',
            qs: {
                'q': keyword + " filter:videos min_retweets:1 exclude:retweets",
                'lang': 'ja',
                'count': 100,
                'result_type': 'recent'
            },
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            }
        };
        return new Promise(function (resolve, reject) {
            _this.get(options).then(function (data) {
                try {
                    var statuses = data.statuses;
                    if (statuses.length == 0) {
                        reject(TwitterError.NOT_FOUND);
                        return;
                    }
                    var mediaURLs_2 = [];
                    statuses.forEach(function (t) {
                        if (!t.extended_entities)
                            return;
                        if (!t.extended_entities.media)
                            return;
                        if (!t.extended_entities.media[0])
                            return;
                        if (!t.extended_entities.media[0].video_info)
                            return;
                        var video_info = t.extended_entities.media[0].video_info;
                        var thumbnail_url = t.extended_entities.media[0].media_url_https;
                        var maxBitrate = 0;
                        var url = null;
                        video_info.variants.forEach(function (v) {
                            if (maxBitrate < v.bitrate) {
                                maxBitrate = v.bitrate;
                                url = v.url;
                            }
                        });
                        if (url) {
                            var tweet = {
                                videoURL: url,
                                imageURL: thumbnail_url,
                                url: 'https://twitter.com/statuses/' + t.id_str
                            };
                            mediaURLs_2.push(tweet);
                        }
                    });
                    if (mediaURLs_2.length > 0) {
                        resolve(mediaURLs_2);
                    }
                    else {
                        reject(TwitterError.NOT_FOUND);
                    }
                    return;
                }
                catch (e) {
                    console.log(e);
                    reject(TwitterError.UNKNOWN_ERROR_1);
                    return;
                }
            })["catch"](function (e) {
                reject(e);
            });
        });
    };
    return Twitter;
}(events_1.EventEmitter));
exports.Twitter = Twitter;
var TwitterError;
(function (TwitterError) {
    TwitterError[TwitterError["NOT_FOUND"] = 0] = "NOT_FOUND";
    TwitterError[TwitterError["SERVER_ERROR"] = 1] = "SERVER_ERROR";
    TwitterError[TwitterError["UNKNOWN_ERROR_1"] = 2] = "UNKNOWN_ERROR_1";
    TwitterError[TwitterError["UNKNOWN_ERROR_2"] = 3] = "UNKNOWN_ERROR_2";
})(TwitterError = exports.TwitterError || (exports.TwitterError = {}));
