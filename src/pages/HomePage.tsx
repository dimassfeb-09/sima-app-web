import { useState, useEffect } from "react";
import {
  LocalPolice,
  LocalHospital,
  LocalFireDepartment,
} from "@mui/icons-material";
import { User } from "../types/user";
import NavBar from "../components/NavBar";
import HereMapPage from "./HereMapPage";
import { getCountByType } from "../models/organizations";

export default function HomePage({ userInfo }: { userInfo: User | null }) {
  const [policeCount, setPoliceCount] = useState<string>("0");
  const [ambulanceCount, setAmbulanceCount] = useState<string>("0");
  const [firefighterCount, setFirefighterCount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const ambulance = await getCountByType("ambulance");
        const police = await getCountByType("police");
        const firefighter = await getCountByType("firefighter");

        if (ambulance) setAmbulanceCount(ambulance.value.toString());
        if (police) setPoliceCount(police.value.toString());
        if (firefighter) setFirefighterCount(firefighter.value.toString());
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false); // Set loading to false after data fetching is done
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="bg-[#f0f5f9]">
      <NavBar userInfo={userInfo} />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen w-full">
          Loading...
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col gap-5 py-10 px-5 md:px-36">
            <div className="flex flex-col md:flex-row gap-5 w-full">
              <div className="flex items-center gap-7 border px-5 py-10 w-full md:w-1/2 lg:w-3/4 bg-white">
                <div>
                  <LocalPolice style={{ height: 70, width: 70 }} />
                </div>
                <div>
                  <div className="text-3xl font-bold">{policeCount}</div>
                  <div className="text-sm">Total Polisi</div>
                </div>
              </div>

              <div className="flex items-center gap-7 border px-5 py-10 w-full md:w-1/2 lg:w-3/4 bg-white">
                <div>
                  <LocalFireDepartment style={{ height: 70, width: 70 }} />
                </div>
                <div>
                  <div className="text-3xl font-bold">{firefighterCount}</div>
                  <div className="text-sm">Total Pemadam Kebakaran</div>
                </div>
              </div>

              <div className="flex items-center gap-7 border px-5 py-10 w-full md:w-1/2 lg:w-3/4 bg-white">
                <div>
                  <LocalHospital style={{ height: 70, width: 70 }} />
                </div>
                <div>
                  <div className="text-3xl font-bold">{ambulanceCount}</div>
                  <div className="text-sm">Total Rumah Sakit / Ambulance</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute flex justify-center items-center w-[500px]">
            <HereMapPage userInfo={userInfo} />
          </div>
        </>
      )}{" "}
    </div>
  );
}
