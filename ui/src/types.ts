export interface User {
  data: {
    allow_orcid_push: boolean | null;
    email: string;
    profile_control_number: number;
    roles: string[];
  }
}

export interface Credentials {
  email: string;
  password: string;
}
