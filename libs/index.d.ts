/// <reference types="node" />
import { EventEmitter } from 'events';
export declare const API: {
    host: string;
    push_path: string;
    multicast_path: string;
    reply_path: string;
    profile_path: string;
};
export declare class Line extends EventEmitter {
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
    push(to: string, messages: LineSendMessage[]): Promise<{}>;
    multicast(to: string, messages: LineSendMessage[]): Promise<{}>;
    reply(replyToken: string, messages: LineSendMessage[]): Promise<{}>;
    getProfile(userId: string): Promise<{}>;
}
export interface LineData {
    events: LineEvent[];
}
export interface LineMessage {
    id: string;
    type: string;
    text: string;
}
export interface LineSendMessage {
    type: string;
    text?: string;
    originalContentUrl?: string;
    previewImageUrl?: string;
}
export interface LineEvent {
    replyToken: string;
    type: string;
    timestamp: string;
    source: {
        type: string;
        userId: string;
        groupId: string;
    };
    message: LineMessage;
}
export interface LineProfile {
    displayName: string;
    userId: string;
    pictureUrl: string;
    statusMessage: string;
}
