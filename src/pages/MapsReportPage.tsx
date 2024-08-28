import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchOrganizationByUserId } from "../models/organizations";
import { fetchReportsByOrganizationId } from "../models/report";
import { User } from "../types/user";
import { Marker } from "../models/marker";
import HereMapPage from "./HereMapPage";

export default function MapsReportPage({
  userInfo,
}: {
  userInfo: User | null;
}) {
  const [reports, setReports] = useState<Marker[]>([]); // Define type according to your report structure

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo?.user_id) {
        try {
          // Fetch organization ID based on user ID
          const orgResponse = await fetchOrganizationByUserId(userInfo.user_id);
          if (orgResponse?.data) {
            const organizationId = orgResponse.data.id;
            const reportsResponse = await fetchReportsByOrganizationId(
              organizationId!
            );

            if (reportsResponse) {
              console.log(reportsResponse);

              const markers: Marker[] = reportsResponse.map((item: any) => ({
                user_id: item.reports.user_id,
                name: item.reports.title,
                latitude: item.reports.latitude,
                longitude: item.reports.longitude,
              }));
              setReports(markers);
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
      <div className="absolute flex justify-center items-center ">
        <HereMapPage markers={reports} userInfo={userInfo} />
      </div>
    </>
  );
}
