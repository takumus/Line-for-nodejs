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
            request(options, function(error, response, body) {
                console.log(`getImage -> ${keyword}`);
                if (error) {
                    console.log(error);
                    reject(TwitterError.SERVER_ERROR);
                    return;
                }
                let statuses;
                try {
                    statuses = eval(body).statuses;
                    if (statuses.length == 0) {
                        reject(TwitterError.NOT_FOUND);
                        return;
                    }
                    const mediaURLs: Tweet[] = [];
                    statuses.forEach((tweet: any) => {
                        const entities = tweet.entities;
                        const media = entities.media;
                        if (media && media.length > 0) {
                            const url = media[0].media_url_https;
                            if (url) {
                                const tweet: Tweet = {
                                    imageURL: media[0].media_url_https
                                };
                                mediaURLs.push(tweet);
                            }
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
    imageURL: string;
}