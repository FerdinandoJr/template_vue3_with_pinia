import type { TicketStatus } from "../valueObjects/ticket-status.enum";
import type { TicketPriority } from "../valueObjects/ticket-priority.enum";
import type { TicketType } from "../valueObjects/ticket-type.enum";

export interface ITag {
  id?: string;
  name: string;
  color?: string;
}

export interface IChecklistItem {
  id?: string;
  title: string;
  completed?: boolean;
  order?: number;
}

export interface IAttachment {
  id?: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
  fileSize?: number;
}

export interface ICustomer {
  id: string;
  name: string;
  tradeName?: string;
  companyName?: string;
  type?: 'PJ' | 'PF';
}

export interface ITicket {
  id?: string;
  ticketNumber?: string;
  title: string;
  description?: string;
  customerId?: string;
  customer?: ICustomer;
  status: TicketStatus;
  priority: TicketPriority;
  type?: TicketType;
  createdAt?: Date;
  updatedAt?: Date;
  
  assignees?: string[];
  assignedTo?: string;
  assignee?: any;
  
  startDate?: string | Date;
  endDate?: string | Date;
  estimatedHours?: number;
  
  tags?: ITag[];
  checklist?: IChecklistItem[];
  attachments?: IAttachment[];
  
  boardId?: string;
  
  metadata?: Record<string, any>;
}