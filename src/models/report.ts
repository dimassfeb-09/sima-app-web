import supabase from "../utils/supabase";

export async function fetchReportById(reportId: number) {
    const { data, error } = await supabase
      .from('report_assignments')
      .select(`
        report_id:reports(id),
        report_title:reports(title),
        report_description:reports(description),
        report_status:reports(status),
        report_latitude:reports(latitude),
        report_longitude:reports(longitude),
        report_user_id:reports(user_id),
        organization_name:organizations(name),
        organization_latitude:organizations(latitude),
        organization_longitude:organizations(longitude),
        organization_user_id:organizations(user_id),
        assigned_at,
        assignment_status:status,
        assignment_distance:distance
      `)
      .eq('report_id', reportId) 
      .order('assigned_at', { ascending: false }).maybeSingle();
  
    if (error) {
      return null;
    }
  
    return data ;
  }
  export async function fetchReportsByOrganizationId(organizationId: number) {
    const { data, error } = await supabase
      .from('report_assignments')
      .select(`
        reports (
          id: id,
          title: title,
          description: description,
          status: status, 
          latitude: latitude,
          longitude: longitude, 
          user_id: user_id
        ),
        organizations ( 
          name: name,
          latitude: latitude,
          longitude: longitude,
          user_id: user_id
        ),
        assigned_at,
        status: status,
        distance: distance
      `)
      .eq('organization_id', organizationId)
      .order('assigned_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching reports by organization ID:', error);
      return null;
    }

    return data;
}