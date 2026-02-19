import type { ChatContact } from "../../domain/entities/ChatContact";
import type { ChatMessage } from "../../domain/entities/ChatMessage";
import type { IChatRepository } from "../../domain/repositories/IChatRepository";

export class InMemoryChatRepository implements IChatRepository {
  private contacts: ChatContact[] = [
    {
      id: 1,
      name: "Fernanda Lima",
      company: "Tech Solutions",
      photoUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Pode confirmar o recebimento?",
      time: "10:42",
      unread: 2,
      channel: "whatsapp",
      status: "open",
      tags: ["Financeiro", "VIP"],
      email: "fernanda@tech.com",
      phone: "(11) 99999-8888",
    },
    {
      id: 2,
      name: "Roberto Carlos",
      company: "Construtora RC",
      photoUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Obrigado pelo suporte!",
      time: "09:15",
      unread: 0,
      channel: "whatsapp",
      status: "pending",
      tags: ["Dúvida"],
      email: "roberto@rc.com",
      phone: "(11) 98888-7777",
    },
    {
      id: 3,
      name: "Amanda Silva",
      company: "Design Studio",
      photoUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Qual o prazo de entrega?",
      time: "Ontem",
      unread: 0,
      channel: "whatsapp",
      status: "pending",
      tags: ["Novo"],
      email: "amanda@design.com",
      phone: "(21) 97777-6666",
    },
  ];

  private messages: ChatMessage[] = [
    {
      id: 1,
      chatId: 1,
      text: "Atendimento iniciado.",
      sender: "system",
      type: "text",
      time: "09:50",
      status: "read",
    },
    {
      id: 2,
      chatId: 1,
      text: "Bom dia, gostaria de saber sobre minha fatura.",
      sender: "client",
      type: "text",
      time: "09:55",
      status: "read",
    },
    {
      id: 3,
      chatId: 1,
      text: "Olá Fernanda! Vou verificar para você agora mesmo.",
      sender: "me",
      type: "text",
      time: "10:00",
      status: "read",
    },
    {
      id: 4,
      chatId: 1,
      text: "Cliente solicita fatura vencida.",
      sender: "me",
      type: "note",
      time: "10:05",
      status: "read",
    },
    {
      id: 5,
      chatId: 1,
      text: "Pode confirmar o recebimento?",
      sender: "client",
      type: "text",
      time: "10:42",
      status: "read",
    },
  ];

  async getContacts(): Promise<ChatContact[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...this.contacts]), 300),
    );
  }

  async getMessages(contactId: number): Promise<ChatMessage[]> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(this.messages.filter((m) => m.chatId === contactId)),
        200,
      ),
    );
  }

  async sendMessage(message: ChatMessage): Promise<void> {
    return new Promise((resolve) => {
      this.messages.push(message);
      const contact = this.contacts.find((c) => c.id === message.chatId);
      if (contact && message.type !== "note" && message.sender !== "system") {
        contact.lastMessage = message.text;
        contact.time = message.time;
      }
      resolve();
    });
  }
}
