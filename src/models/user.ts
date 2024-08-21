import { auth } from '../utils/firebase'; // Adjust the import path
import { User } from '../types/user'; // Adjust the import path
import supabase from '../utils/supabase';

export const getUserInfo = async (): Promise<User | null> => {
    try {
      const currentUser = auth.currentUser;
  
      if (currentUser) {
        const { data: userRecord } = await supabase
        .from("users")
        .select("id")
        .eq("uid", currentUser?.uid)
        .single();

         
 
        return {
          user_id: userRecord?.id,
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  };