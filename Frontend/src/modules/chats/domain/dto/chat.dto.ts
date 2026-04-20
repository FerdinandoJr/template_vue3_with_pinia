import { MessageType } from '../valueObjects/chat-enums';


export interface SendMessageDTO {
    contactId: string;
    text: string;
    type: MessageType;
    file?: File;
}

export interface TakeChatDTO {
    contactId: string;
    agentId: string;
}

export interface TransferChatDTO {
    contactId: string;
    destinationId?: string;
}

export interface FinishChatDTO {
    contactId: string;
    reason?: string;
}