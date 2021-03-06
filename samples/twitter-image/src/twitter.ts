import * as request from 'request';
import { EventEmitter } from 'events';
export class Twitter extends EventEmitter {
    private accessToken: string;
    constructor(consumerKey: string, consumerKeySecret: string) {
        super();
        const options = {
            url: 'https://api.twitter.com/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + new Buffer(consumerKey + ':' + consumerKeySecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
            body: 'grant_type=client_credentials'
        };
        request.post(options, (error, response, body) => {
            if (error) return;
            this.accessToken = JSON.parse(body)['access_token'];
            this.emit('init', this.accessToken);
        });
    }
    public get(options: request.Options) {
        return new Promise((resolve: (data: any) => void, reject) => {
            request(options, function(error, response, body) {
                if (error) {
                    console.log(error);
                    reject(TwitterError.SERVER_ERROR);
                    return;
                }
                try {
                    resolve(eval(body));
                }catch (e) {
                    reject(TwitterError.UNKNOWN_ERROR_1);
                }
            });
        });
    }
    public getImage(keyword: string) {
        const options = {
            method: 'GET',
            json: true,
            url: 'https://api.twitter.com/1.1/search/tweets.json',
            qs: {
                'q' : `${keyword} filter:images min_retweets:1 exclude:retweets`,
                'lang' : 'ja',
                'count' : 100,
                'result_type' : 'recent'
            },
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            }
        };
        return new Promise((resolve: (urls: Tweet[]) => void, reject) => {
            this.get(options).then((data) => {
                try {
                    const statuses = data.statuses;
                    if (statuses.length == 0) {
                        reject(TwitterError.NOT_FOUND);
                        return;
                    }
                    const mediaURLs: Tweet[] = [];
                    statuses.forEach((t: any) => {
                        const media = (t.extended_entities && t.extended_entities.media) ? t.extended_entities.media : t.entities.media;
                        if (media && media.length > 0) {
                            media.forEach((m: any) => {
                                const url = m.media_url_https;
                                if (url) {
                                    const tweet: Tweet = {
                                        imageURL: url,
                                        url: `https://twitter.com/${t.user.screen_name}/statuses/` + t.id_str,
                                        favorite: t.favorite_count
                                    };
                                    mediaURLs.push(tweet);
                                }
                            });
                        }
                    });
                    if (mediaURLs.length > 0) {
                        resolve(mediaURLs);
                    }else {
                        reject(TwitterError.NOT_FOUND);
                    }
                    return;
                }catch (e) {
                    console.log(e);
                    reject(TwitterError.UNKNOWN_ERROR_1);
                    return;
                }
            }).catch((e) => {
                reject(e);
            });
        });
    }

    public getVideo(keyword: string) {
        const options = {
            method: 'GET',
            json: true,
            url: 'https://api.twitter.com/1.1/search/tweets.json',
            qs: {
                'q' : `${keyword} filter:videos min_retweets:1 exclude:retweets`,
                'lang' : 'ja',
                'count' : 100,
                'result_type' : 'recent'
            },
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            }
        };
        return new Promise((resolve: (urls: Tweet[]) => void, reject) => {
            this.get(options).then((data) => {
                try {
                    const statuses = data.statuses;
                    if (statuses.length == 0) {
                        reject(TwitterError.NOT_FOUND);
                        return;
                    }
                    const mediaURLs: Tweet[] = [];
                    statuses.forEach((t: any) => {
                        if (!t.extended_entities) return;
                        if (!t.extended_entities.media) return;
                        if (!t.extended_entities.media[0]) return;
                        if (!t.extended_entities.media[0].video_info) return;
                        const video_info = t.extended_entities.media[0].video_info;
                        const thumbnail_url = t.extended_entities.media[0].media_url_https;
                        let maxBitrate = 0;
                        let url = null;
                        video_info.variants.forEach((v: any) => {
                            if (maxBitrate < v.bitrate) {
                                maxBitrate = v.bitrate;
                                url = v.url;
                            }
                        });
                        if (url) {
                            const tweet: Tweet = {
                                videoURL: url,
                                imageURL: thumbnail_url,
                                url: `https://twitter.com/${t.user.screen_name}/statuses/` + t.id_str,
                                favorite: t.favorite_count
                            };
                            mediaURLs.push(tweet);
                        }
                    });
                    if (mediaURLs.length > 0) {
                        resolve(mediaURLs);
                    }else {
                        reject(TwitterError.NOT_FOUND);
                    }
                    return;
                }catch (e) {
                    console.log(e);
                    reject(TwitterError.UNKNOWN_ERROR_1);
                    return;
                }
            }).catch((e) => {
                reject(e);
            });
        });
    }
}
export enum TwitterError {
    NOT_FOUND,
    SERVER_ERROR,
    UNKNOWN_ERROR_1,
    UNKNOWN_ERROR_2
}
export interface Tweet {
    imageURL?: string;
    videoURL?: string;
    url: string;
    favorite: number;
}