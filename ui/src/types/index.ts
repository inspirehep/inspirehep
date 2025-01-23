import {
  LITERATURE_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  AUTHORS_PID_TYPE,
  INSTITUTIONS_PID_TYPE,
  SEMINARS_PID_TYPE,
  JOURNALS_PID_TYPE,
  DATA_PID_TYPE,
} from '../common/constants';

declare global {
  interface Window {
    CONFIG: any;
  }
}

export type PidType =
  | typeof LITERATURE_PID_TYPE
  | typeof JOBS_PID_TYPE
  | typeof CONFERENCES_PID_TYPE
  | typeof AUTHORS_PID_TYPE
  | typeof INSTITUTIONS_PID_TYPE
  | typeof SEMINARS_PID_TYPE
  | typeof JOURNALS_PID_TYPE
  | typeof DATA_PID_TYPE;

export type PidValue = string | number;

export interface User {
  data: {
    allow_orcid_push: boolean | null;
    email: string;
    profile_control_number: number;
    roles: string[];
  };
}

export interface Credentials {
  email?: string | null;
  password?: string | null;
}
