import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './database/postgres/user.entity';
import { Tenant } from './database/postgres/tenant.entity';
import { UserPermissions } from './database/postgres/user-permissions.entity';
import { Ticket } from './modules/Tickets/data/ticket.entity';
import { TicketTag } from './modules/Tickets/data/ticket-tag.entity';
import { TicketChecklist } from './modules/Tickets/data/ticket-checklist.entity';
import { TicketAttachment } from './modules/Tickets/data/ticket-attachment.entity';
import { Customer } from './modules/Customer/data/customer.entity';
import { CustomerSource } from './modules/Customer/data/customer-source.entity';
import { Service, ServiceHistory } from './modules/Services/data/service.entity';
import { Agenda } from './modules/Calendar/data/agenda.entity';
import { KanbanColumn, KanbanCard, KanbanBoard } from './modules/Kanban/data/kanban.entity';
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
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Tenant,
    UserPermissions,
    Ticket,
    TicketTag,
    TicketChecklist,
    TicketAttachment,
    Customer,
    CustomerSource,
    Service,
    ServiceHistory,
    Agenda,
    KanbanColumn,
    KanbanCard,
    KanbanBoard,
    Chat,
    ChatMessage,
    KbArticle,
    Settings,
  ],
  // migrations: ['src/database/migrations/*{.ts,.js}'],
  // migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  },
});