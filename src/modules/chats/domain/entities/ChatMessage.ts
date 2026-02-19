export type MessageSender = 'me' | 'client' | 'system';
export type MessageType = 'text' | 'note' | 'image';

export interface ChatMessage {
    id: number;
    chatId: number;
    text: string;
    sender: MessageSender;
    type: MessageType;
    time: string;
    status: 'sent' | 'read';
}