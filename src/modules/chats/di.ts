import { InMemoryChatRepository } from "./infra/repositories/InMemoryChatRepository";
import { GetContacts } from "./application/usecases/GetContacts";
import { GetMessages } from "./application/usecases/GetMessages";
import { SendMessage } from "./application/usecases/SendMessage";

const repository = new InMemoryChatRepository();

export const getContactsUseCase = new GetContacts(repository);
export const getMessagesUseCase = new GetMessages(repository);
export const sendMessageUseCase = new SendMessage(repository);