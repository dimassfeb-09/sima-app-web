import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchOrganizationByUserId } from "../models/organizations";
import { fetchReportsByOrganizationId } from "../models/report";
import { Users } from "../types/user";
import { Marker } from "../types/marker";
import HereMapPage from "./HereMapPage";

export default function MapsReportPage({
  userInfo,
}: {
  userInfo: Users | null;
}) {
  const [reports, setReports] = useState<Marker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo?.id) {
        setLoading(true);
        try {
          const orgResponse = await fetchOrganizationByUserId(userInfo.id);
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
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userInfo]);

  return (
    <>
      <NavBar userInfo={userInfo} />
      {loading ? (
        <div className="flex justify-center items-center h-screen w-screen absolute top-0 left-0 bg-white">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="absolute flex justify-center items-center">
          <HereMapPage markers={reports} userInfo={userInfo} />
        </div>
      )}
    </>
  );
}
