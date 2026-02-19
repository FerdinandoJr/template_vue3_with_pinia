import type { ChatContact } from "../entities/ChatContact";
import type { ChatMessage } from "../entities/ChatMessage";

export interface IChatRepository {
    getContacts(): Promise<ChatContact[]>;
    getMessages(contactId: number): Promise<ChatMessage[]>;
    sendMessage(message: ChatMessage): Promise<void>;
}