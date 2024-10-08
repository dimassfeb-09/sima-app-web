import { auth } from '../utils/firebase'; // Adjust the import path
import { Users } from '../types/user'; // Adjust the import path
import supabase from '../utils/supabase';


// Constants for retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // in milliseconds

export const getUserInfo = async (): Promise<Users | null> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return null;

      // Fetch user record from the database
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('uid', currentUser.uid)
        .maybeSingle();

      if (userError) throw new Error(`Error fetching user record: ${userError.message}`);

      if (userRecord) {
        return userRecord as Users;
      }

    } catch (error) {
      console.log(error);
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error('Max retries reached. Returning null.');
      }
    }
  }

  return null;
};


// Function to create a new user in the database
export const createUser = async (user: any) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select('id')
    .single();

  if (error) {
    return { data: null, error }; 
  }

  // Return the id of the newly created user
  return { data: data ? data.id : null, error: null }; 
};


// Function to fetch all users from the database
export const fetchUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  return { data, error };
};

// Function to fetch a specific user by UID
export const fetchUserByUid = async (uid: string) => {
  const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
  return { data, error };
};

// Function to update a user's information
export const updateUser = async (uid: string, updates: Partial<Users>) => {
  const { data, error } = await supabase.from('users').update(updates).eq('uid', uid);
  return { data, error };
};

// Function to delete a user by UID
export const deleteUserByUid = async (uid: string) => {
  const { data, error } = await supabase.from('users').delete().eq('uid', uid);
  return { data, error };
};


export const deleteUserById = async (uid: string) => {
  const { data, error } = await supabase.from('users').delete().eq('id', uid);
  return { data, error };
};
