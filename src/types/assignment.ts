import { Organization } from "./organization";
import { Report } from "./report";

export interface Assignment {
    assigned_at: string;
    status: string;
    distance: number;
    reports: Report;
    organizations: Organization;
  }