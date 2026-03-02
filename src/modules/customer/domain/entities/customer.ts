import type { CustomerStatus } from "../valueObjects/customer-status.enum"

export interface IContactPerson {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

export interface ICustomer {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: CustomerStatus;
  source: string;
  companyName: string;
  tradeName?: string;
  document?: string;
  website?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  contacts?: string[];
  additionalContacts?: IContactPerson[];
  lastInteraction: Date;
  openTickets: number;
  csat: number;
}