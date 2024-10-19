import { UserReport } from "./user";

export interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  user_id: number;
  address: string;
  image_url: string;
  type: string;
  users: UserReport;
}
