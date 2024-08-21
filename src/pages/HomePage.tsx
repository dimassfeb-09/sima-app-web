import { useState, useEffect } from "react";
import {
  LocalPolice,
  LocalHospital,
  LocalFireDepartment,
} from "@mui/icons-material";
import { User } from "../types/user";
import NavBar from "../components/NavBar";

export default function HomePage({ userInfo }: { userInfo: User | null }) {
  const [policeCount, setPoliceCount] = useState<string>("0");
  const [ambulanceCount, setAmbulanceCount] = useState<string>("0");
  const [firefighterCount, setFirefighterCount] = useState<string>("0");

  useEffect(() => {
    setPoliceCount(localStorage.getItem("policeCount") || "0");
    setAmbulanceCount(localStorage.getItem("ambulanceCount") || "0");
    setFirefighterCount(localStorage.getItem("firefighterCount") || "0");
  }, []);

  return (
    <div className="bg-[#f0f5f9]">
      <NavBar userInfo={userInfo} />

      <div className=" w-full flex flex-col gap-5 py-10 px-5 md:px-36 ">
        <div className="flex flex-col md:flex-row gap-5 w-full">
          <div className="flex items-center gap-7 border px-5 py-10 w-full md:1/2 lg:w-3/4 bg-white">
            <div>
              <LocalPolice style={{ height: 70, width: 70 }} />
            </div>
            <div>
              <div className="text-3xl font-bold">{policeCount}</div>
              <div className="text-sm">Total Polisi</div>
            </div>
          </div>

          <div className="flex items-center gap-7 border px-5 py-10 w-full md:1/2 lg:w-3/4 bg-white">
            <div>
              <LocalFireDepartment style={{ height: 70, width: 70 }} />
            </div>
            <div>
              <div className="text-3xl font-bold">{firefighterCount}</div>
              <div className="text-sm">Total Pemadam Kebakaran</div>
            </div>
          </div>

          <div className="flex items-center gap-7 border px-5 py-10 w-full md:1/2 lg:w-3/4 bg-white">
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
    </div>
  );
}
