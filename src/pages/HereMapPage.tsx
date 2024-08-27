import { useEffect, useState, useCallback } from "react";
import { User } from "../types/user";
import MapComponent from "./HereMap";
import supabase from "../utils/supabase";

interface HereMapPageProps {
  userInfo: User | null;
}

export default function HereMapPage({ userInfo }: HereMapPageProps) {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  // Function to fetch location data based on instance type
  const fetchLocationData = useCallback(async (typeInstance: string) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("user_id, name, latitude, longitude")
        .eq("instance_type", typeInstance);

      if (error) {
        throw new Error(`Error fetching locations: ${error.message}`);
      }

      setLocationData(data || []);
    } finally {
      setDataFetched(true);
    }
  }, []);

  useEffect(() => {
    if (userInfo?.account_type) {
      fetchLocationData(userInfo.account_type);
    }
  }, [userInfo?.account_type, fetchLocationData]);

  return (
    <div>
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
