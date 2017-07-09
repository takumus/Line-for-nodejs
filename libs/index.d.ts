/// <reference types="node" />
import { EventEmitter } from 'events';
import { SendMessage } from './types';
export * from './types';
export declare const API: {
    host: string;
    push_path: string;
    multicast_path: string;
    reply_path: string;
    profile_path: string;
};
export declare const create: {
    TextMessage: (message: string) => {
        type: string;
        text: string;
    };
    ImageMessage: (url: string) => {
        type: string;
        originalContentUrl: string;
        previewImageUrl: string;
    };
};
export declare class Connector extends EventEmitter {
    private channelSecret;
    private channelAccessToken;
    private serverPort;
    constructor(channelSecret: string, channelAccessToken: string, serverPort: number);
    private init();
    private onData(data);
    private onEvent(event, id);
    private onMessage(message, replyToken, event);
    send(path: string, data: any): Promise<{}>;
    get(path: string): Promise<{}>;
    push(to: string, messages: SendMessage[]): Promise<{}>;
    multicast(to: string, messages: SendMessage[]): Promise<{}>;
    reply(replyToken: string, messages: SendMessage[]): Promise<{}>;
    getProfile(userId: string): Promise<{}>;
}
