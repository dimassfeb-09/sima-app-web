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

export const getCountsAndSaveToLocalStorage = async () => {
  try {
    const instanceTypes = ["ambulance", "police", "firefighter"];

    const results = await Promise.all(
      instanceTypes.map((type) =>
        supabase
          .from("organization")
          .select("*")
          .eq("instance_type", type)
      )
    );

    const counts = results.map((res) => res.data?.length || 0);

    instanceTypes.forEach((type, index) => {
      localStorage.setItem(`${type}Count`, counts[index].toString());
    });

    console.log("Data saved to local storage");
  } catch (error) {
    console.error("Error fetching or saving data:", error);
  }
};
