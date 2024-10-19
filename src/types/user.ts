export interface Users {
  id: number;
  uid: string;
  full_name: string;
  email: string;
  nik: string;
  created_at: string;
  account_type: string;
}

export interface UserReport {
  id: number;
  uid: string;
  full_name: string;
  email: string;
  phone: string;
}
