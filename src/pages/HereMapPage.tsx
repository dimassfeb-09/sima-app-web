import { Users } from "../types/user";
import MapComponent from "./HereMap";
import { Marker } from "../types/marker";

interface HereMapPageProps {
  userInfo: Users | null;
  markers: Marker[];
}

export default function HereMapPage({ userInfo, markers }: HereMapPageProps) {
  return (
    <div className="bg-teal-500">
      <div className="w-full">
        <MapComponent markers={markers} userInfo={userInfo} />
      </div>
    </div>
  );
}
