import { Organization } from "./organization";
import { Report } from "./report";

export interface Assignment {
    id: number;
    assigned_at: string;
    status: string;
    distance: number;
    reports: Report;
    organizations: Organization;
  }