import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchOrganizationByUserId } from "../models/organizations";
import { fetchReportsByOrganizationId } from "../models/report";
import { Users } from "../types/user";
import { Marker } from "../types/marker";
import LeafletMapComponent from "./LeafletMap";

export default function MapsReportPage({
  userInfo,
}: {
  userInfo: Users | null;
}) {
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo?.id) {
        try {
          const orgResponse = await fetchOrganizationByUserId(userInfo.id);
          if (orgResponse?.data) {
            const organizationId = orgResponse.data.id;
            const reportsResponse = await fetchReportsByOrganizationId(
              organizationId!
            );

            if (reportsResponse) {
              const markers: Marker[] = reportsResponse.map((item: any) => ({
                user_id: item.reports.user_id,
                name: item.reports.title,
                status: item.reports.status,
                latitude: item.reports.latitude,
                longitude: item.reports.longitude,
              }));
              setMarkers(markers);
            }
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      }
    };

    fetchData();
  }, [userInfo]);

  return (
    <>
      <NavBar userInfo={userInfo} />
      <div className="flex-1 h-full w-full">
        <LeafletMapComponent markers={markers} userInfo={userInfo} />
      </div>
    </>
  );
}
