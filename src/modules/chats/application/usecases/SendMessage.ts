import type { ChatMessage, MessageType } from "../../domain/entities/ChatMessage";
import type { IChatRepository } from "../../domain/repositories/IChatRepository";

export class SendMessage {
    constructor(private readonly repository: IChatRepository) {}

    async execute(chatId: number, text: string, type: MessageType = 'text'): Promise<ChatMessage> {
        const newMessage: ChatMessage = {
            id: Date.now(),
            chatId,
            text,
            sender: 'me',
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        await this.repository.sendMessage(newMessage);
        return newMessage;
    }
}