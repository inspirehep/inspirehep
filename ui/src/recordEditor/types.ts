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
