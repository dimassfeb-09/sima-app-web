import supabase from "../utils/supabase";
import { Assignment } from "../types/assignment";


export async function fetchReportById(reportId: number): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('report_assignments')
    .select(`
      id,
      assigned_at,
      assignment_status:status,
      assignment_distance:distance,
      reports (
        id,
        title,
        description,
        status,
        latitude,
        longitude,
        user_id,
        address,
        image_url,
        type
      ),
      organizations (
        name,
        latitude,
        longitude,
        user_id,
        instance_type
      )
    `)
    .eq('reports.id', reportId)
    .order('assigned_at', { ascending: false })
    .maybeSingle();

  if (error) {
    
    console.error("Error fetching report:", error.message);
    return null;
  }

  if (data) {
    const assignment: Assignment = {
      id: data.id,
      assigned_at: data.assigned_at,
      status: data.assignment_status,
      distance: data.assignment_distance,
      reports: data.reports[0],
      organizations: data.organizations[0]
    };

    return assignment;
  }

  return null;
}

export async function fetchReportsByOrganizationId(organizationId: number): Promise<Assignment[] | null> {
  const { data, error } = await supabase
    .from('report_assignments')
    .select(`
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
        user_id,
        address,
        image_url,
        type
      ),
      organizations (
        name,
        latitude,
        longitude,
        user_id
      )
    `)
    .eq('organization_id', organizationId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
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



export async function updateReportStatus(reportId: number, newStatus: string): Promise<boolean> {
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('report_assignments')
    .select('report_id')
    .eq('id', reportId)
    .single();

  if (assignmentError || !assignmentData) {
    console.error("Error fetching report_id from report_assignments:", assignmentError?.message || "No data found");
    return false;
  }

  const { report_id } = assignmentData;

  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('report_assignments')
    .update({ status: newStatus })
    .eq('id', reportId);

  if (assignmentsError) {
    console.error("Error updating report_assignments status:", assignmentsError.message);
    return false;
  }

  const { data: reportsData, error: reportsError } = await supabase
    .from('reports')
    .update({ status: newStatus })
    .eq('id', report_id);

  if (reportsError) {
    console.error("Error updating reports status:", reportsError.message);
    return false;
  }

  const success = (assignmentsData && reportsData) ? true : false;
  return success;
}
