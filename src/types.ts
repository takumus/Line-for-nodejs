export interface Data {
    events: Event[];
}
export interface Message {
    id: string;
    type: string;
    text: string;
}
export interface SendMessage {
    type: string;
    text?: string;
    originalContentUrl?: string;
    previewImageUrl?: string;
}
export interface Event {
    replyToken: string;
    type: string;
    timestamp: string;
    source: {
        type: string;
        userId: string;
        groupId: string;
        roomId: string;
    };
    message: Message;
}
export interface Profile {
    displayName: string;
    userId: string;
    pictureUrl: string;
    statusMessage: string;
}