export type ChatChannel = 'whatsapp' | 'instagram' | 'web';
export type ChatStatus = 'open' | 'pending' | 'closed';

export interface ChatContact {
    id: number;
    name: string;
    company: string;
    photoUrl: string;
    lastMessage: string;
    time: string;
    unread: number;
    channel: ChatChannel;
    status: ChatStatus;
    tags: string[];
    email?: string;
    phone?: string;
}