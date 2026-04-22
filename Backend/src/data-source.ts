import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './database/postgres/user.entity';
import { Tenant } from './database/postgres/tenant.entity';
import { Ticket } from './modules/Tickets/data/ticket.entity';
import { Customer } from './modules/Customer/data/customer.entity';
import { CustomerSource } from './modules/Customer/data/customer-source.entity';
import { Agenda } from './modules/Calendar/data/agenda.entity';
import { KanbanColumn, KanbanCard } from './modules/Kanban/data/kanban.entity';
import { Chat, ChatMessage } from './modules/Chats/data/chat.entity';
import { KbArticle } from './modules/KB/data/kb.entity';
import { Settings } from './modules/Settings/data/settings.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'central_atendimento',
  entities: [
    User,
    Tenant,
    Ticket,
    Customer,
    CustomerSource,
    Agenda,
    KanbanColumn,
    KanbanCard,
    Chat,
    ChatMessage,
    KbArticle,
    Settings,
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});