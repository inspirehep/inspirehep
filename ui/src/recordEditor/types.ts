export interface Revision {
  updated: string;
  userEmail: string;
  revisionId: number;
  recUuid: string;
  transactionId: number;
}

export interface RevisionFromApi {
  updated: string;
  user_email: string;
  revision_id: number;
  rec_uuid: string;
  transaction_id: number;
}

export interface Queue {
  name: string;
  id: string;
}

export interface User {
  name: string;
  id: string;
  email: string;
}

export interface TicketFromApi {
  u_functional_category: string;
  assigned_to: string;
  sys_id: string;
  date: string;
  link: string;
  subject: string;
  description: string;
}

export interface Ticket {
  category: string;
  date: string;
  link: string;
  subject: string;
  description: string;
  id: string;
}

export const toTicket = (ticket: TicketFromApi): Ticket => ({
  category: ticket.u_functional_category,
  date: ticket.date,
  link: ticket.link,
  subject: ticket.subject,
  description: ticket.description,
  id: ticket.sys_id,
});
