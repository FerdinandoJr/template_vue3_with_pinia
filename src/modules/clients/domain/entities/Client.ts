export type ClientStatus = "active" | "onboarding" | "blocked" | "inactive";

export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  status: ClientStatus;
  source: string;
  lastInteraction: string;
  openTickets: number;
  csat: number;
  tags: string[];
}
