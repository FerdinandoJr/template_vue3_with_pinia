import type { App, InjectionKey } from 'vue';
import { InMemoryChatRepository } from "./infra/repositories/InMemoryChatRepository";
import { GetContacts } from "./application/usecases/GetContacts";
import { GetMessages } from "./application/usecases/GetMessages";
import { SendMessage } from "./application/usecases/SendMessage";

export const ChatsDI = {
    GetContacts: Symbol('GetContacts') as InjectionKey<GetContacts>,
    GetMessages: Symbol('GetMessages') as InjectionKey<GetMessages>,
    SendMessage: Symbol('SendMessage') as InjectionKey<SendMessage>
};

export function setupChatsDI(app: App) {
    const repository = new InMemoryChatRepository();
    
    app.provide(ChatsDI.GetContacts, new GetContacts(repository));
    app.provide(ChatsDI.GetMessages, new GetMessages(repository));
    app.provide(ChatsDI.SendMessage, new SendMessage(repository));
}