import supabase from "../utils/supabase";
import { Assignment } from "../types/assignment";

export async function fetchReportsByOrganizationId(
  organizationId: number
): Promise<Assignment[] | null> {
  const { data, error } = await supabase
    .from("report_assignments")
    .select(
      `
    id,
    assigned_at,
    status,
    distance,
    reports (
      id,
      title,
      description,
      status,
      latitude,
      longitude,
      address,
      image_url,
      type,
      users:users!report_police_user_id_fkey (
        id,
        uid,
        full_name,
        email,
        phone
      )
    ),
    organizations (
      name,
      latitude,
      longitude,
      user_id
    )
  `
    )
    .eq("organization_id", organizationId)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return null;
  }

  if (!data) return null;

  const assignments: Assignment[] = data.map((item: any) => ({
    id: item.id,
    assigned_at: item.assigned_at,
    status: item.status,
    distance: item.distance,
    reports: item.reports,
    organizations: item.organizations,
  }));

  return assignments;
}

export async function updateReportStatus(
  reportId: number,
  newStatus: string
): Promise<boolean> {
  const { data: assignmentData, error: assignmentError } = await supabase
    .from("report_assignments")
    .select("report_id")
    .eq("id", reportId)
    .single();

  if (assignmentError || !assignmentData) {
    console.error(
      "Error fetching report_id from report_assignments:",
      assignmentError?.message || "No data found"
    );
    return false;
  }

  const { report_id } = assignmentData;

  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from("report_assignments")
    .update({ status: newStatus })
    .eq("id", reportId);

  if (assignmentsError) {
    console.error(
      "Error updating report_assignments status:",
      assignmentsError.message
    );
    return false;
  }

  const { data: reportsData, error: reportsError } = await supabase
    .from("reports")
    .update({ status: newStatus })
    .eq("id", report_id);

  if (reportsError) {
    console.error("Error updating reports status:", reportsError.message);
    return false;
  }

  const success = assignmentsData && reportsData ? true : false;
  return success;
}

export async function updateReportOrganization(
  reportId: number,
  organizationId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("report_assignments")
    .update({ organization_id: organizationId })
    .eq("id", reportId);

  if (error) {
    console.error("Error updating report assignment organization:", error.message);
    return false;
  }

  return data ? true : false;
}