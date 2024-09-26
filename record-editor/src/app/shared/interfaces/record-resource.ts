export interface RecordResource {
  record: {
    metadata: object;
  };
  schema: object;
  user_locks: string;
  task_locks: string;
}
