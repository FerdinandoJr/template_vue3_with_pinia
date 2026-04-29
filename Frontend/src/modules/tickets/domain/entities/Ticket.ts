import type { TicketStatus } from "../valueObjects/ticket-status.enum";
import type { TicketPriority } from "../valueObjects/ticket-priority.enum";
import type { TicketType } from "../valueObjects/ticket-type.enum";

export type TicketSource = 'email' | 'whatsapp' | 'portal' | 'phone' | 'chat' | 'manual';

export interface ITag {
  id?: string;
  name: string;
  color?: string;
  label?: string;
  colorClass?: string;
}

export interface IChecklistItem {
  id?: string;
  title: string;
  completed?: boolean;
  order?: number;
  done?: boolean;
}

export interface IAttachment {
  id?: string;
  fileName: string;
  filePath?: string;
  url?: string;
  mimeType?: string;
  fileSize?: number;
  size?: number;
  name?: string;
}

export interface ICustomer {
  id: string;
  name: string;
  tradeName?: string;
  companyName?: string;
  type?: 'PJ' | 'PF';
  email?: string;
  phone?: string;
}

export interface ITicket {
  id?: string;
  ticketNumber?: string;
  title: string;
  description?: string;
  internalNotes?: string;
  customerId?: string;
  customer?: ICustomer;
  status: TicketStatus;
  priority: TicketPriority;
  type?: TicketType;
  source?: TicketSource;
  
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  
  createdBy?: string;
  
  assignedTo?: string;
  assignees?: string[];
  assignee?: any;
  
  startDate?: string | Date;
  endDate?: string | Date;
  resolvedAt?: string | Date;
  closedAt?: string | Date;
  firstResponseAt?: string | Date;
  
  slaDeadline?: string | Date;
  slaFirstResponse?: string | Date;
  
  estimatedHours?: number;
  actualHours?: number;
  
  tags?: ITag[];
  checklist?: IChecklistItem[];
  attachments?: IAttachment[];
  
  boardId?: string;
  
  metadata?: Record<string, any>;
  
  kanbanColumnId?: string;
  kanbanCardId?: string;
}

export interface ITicketCreate extends Omit<ITicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'> {}

export interface ITicketUpdate extends Partial<ITicketCreate> {}

export interface ITicketFilter {
  query?: string;
  status?: TicketStatus | 'all';
  priority?: TicketPriority;
  type?: TicketType;
  customerId?: string;
  assignedTo?: string;
  dateRange?: [Date, Date];
  ownerOnly?: boolean;
  assignees?: string[];
  page?: number;
  pageSize?: number;
}

export interface ITicketStats {
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  byType: Record<TicketType, number>;
  avgResolutionTime: number;
  firstResponseRate: number;
}