import { ErrorSchema } from '@rjsf/utils';

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

export const toRevision = (revision: RevisionFromApi): Revision => ({
  updated: revision.updated,
  userEmail: revision.user_email,
  revisionId: revision.revision_id,
  recUuid: revision.rec_uuid,
  transactionId: revision.transaction_id,
});

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

export type BackendValidationError = {
  message: string;
  path: (string | number)[];
};

export const toExtraErrors = (
  validationErrors: BackendValidationError[] | undefined
): ErrorSchema | undefined => {
  if (!validationErrors?.length) {
    return undefined;
  }
  const extraErrors: ErrorSchema = {};
  validationErrors.forEach(({ message, path }) => {
    let node: any = extraErrors;
    path.forEach((key) => {
      node[key] = node[key] ?? {};
      node = node[key];
    });
    // eslint-disable-next-line no-underscore-dangle -- it respects the ErrorSchema type
    node.__errors = [...(node.__errors ?? []), message];
  });
  return extraErrors;
};
