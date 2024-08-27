import supabase from "../utils/supabase";

interface Organization {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  user_id: string;
  instance_type: string;
}

interface Result<T> {
  data: T | null;
  error: Error | null;
}

export const createOrganization = async (location: Organization): Promise<Result<any>> => {
  const { data, error } = await supabase
    .from('organizations')
    .insert([location]);

  if (error) {
    console.error('Error creating location instance:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};

export const fetchOrganization = async (): Promise<Result<Organization[]>> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*');

  if (error) {
    console.error('Error fetching location instances:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};

export const fetchOrganizationById = async (id: number): Promise<Result<Organization | null>> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching location instance:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};

export const fetchOrganizationByUserId = async (userId: number): Promise<Result<Organization | null>> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching location instance:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};

export const updateOrganization = async (id: string, updates: Partial<Organization>): Promise<Result<any>> => {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating location instance:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};

export const deleteOrganization = async (id: string): Promise<Result<any>> => {
  const { data, error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting location instance:', error.message);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error};
};


export const getCountByType = async (type: string)  => {
  try {
    const { data, error } = await supabase
      .from("counts")
      .select("title, value")
      .eq("title", type)
      .single(); 

    if (error) {
      throw error;
    } 
 
    return data;
  } catch (error) {
    console.error("Error fetching count by type:", error);
    return null;
  }
};
 


export const incrementCountByType = async (type: string) => {
  try {
    const { data, error } = await supabase
      .from("counts")
      .select("value")
      .eq("title", type)
      .single();

    if (error) {
      throw error;
    }

    const newValue = (data?.value || 0) + 1;

    const { error: updateError } = await supabase
      .from("counts")
      .update({ value: newValue })
      .eq("title", type);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error("Error incremnet count by type:", error);
  }
};
