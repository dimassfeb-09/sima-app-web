import { useEffect, useState, useCallback } from "react";
import { User } from "../types/user";
import MapComponent from "./HereMap";
import supabase from "../utils/supabase";

interface HereMapPageProps {
  userInfo: User | null;
}

export default function HereMapPage({ userInfo }: HereMapPageProps) {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  // Function to fetch location data based on instance type
  const fetchLocationData = useCallback(async (typeInstance: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("user_id, name, latitude, longitude")
        .eq("instance_type", typeInstance);

      if (error) {
        throw new Error(`Error fetching locations: ${error.message}`);
      }

      setLocationData(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDataFetched(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userInfo?.account_type) {
      fetchLocationData(userInfo.account_type);
    }
  }, [userInfo?.account_type, fetchLocationData]);

  return (
    <div>
      {loading && <p>Loading...</p>}

      {dataFetched ? (
        locationData.length > 0 ? (
          <div className="w-full">
            <MapComponent markers={locationData} userInfo={userInfo} />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full bg-teal-500">
            No data available.
          </div>
        )
      ) : null}
    </div>
  );
}
