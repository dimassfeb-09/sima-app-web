import { MapOutlined, PersonOutline } from "@mui/icons-material";
import NavBar from "../components/NavBar";
import { Users } from "../types/user";
import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { toast } from "react-toastify";

export default function SettingsInstansi({
  userInfo,
}: {
  userInfo: Users | null;
}) {
  const [name, setName] = useState<string>(userInfo?.full_name ?? "");
  const [latLong, setLatLong] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      if (userInfo?.id) {
        const { data: existingRecord, error: fetchError } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", userInfo?.id)
          .maybeSingle();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (existingRecord) {
          setName(existingRecord.name || "");
          setLatLong(
            `${existingRecord.latitude || ""}, ${
              existingRecord.longitude || ""
            }`
          );
        } else {
          setName(userInfo.full_name ?? "");
          setLatLong("");
        }
      }
    } catch (e) {
      toast.error(`Error fetching data: ${e}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const [latitude, longitude] = latLong
        .split(",")
        .map((coord) => coord.trim());

      if (!latitude || !longitude) {
        throw new Error("Invalid latitude or longitude");
      }

      const { data: existingRecord, error: fetchError } = await supabase
        .from("organizations")
        .select("*")
        .eq("user_id", userInfo?.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(
          `Fetch error (${fetchError.code}): ${fetchError.message}`
        );
      }

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            name,
            latitude,
            longitude,
          })
          .eq("user_id", userInfo?.id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        toast.success("Data updated successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("organizations")
          .insert([
            {
              name,
              latitude,
              longitude,
              user_id: userInfo?.id,
            },
          ]);

        if (insertError) {
          throw new Error(`Insert failed: ${insertError.message}`);
        }

        toast.success("Data saved successfully!");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      fetchData(); // Refresh data after operation
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar userInfo={userInfo} />

      <div className="flex items-center justify-center mt-10">
        <form
          className="border p-10"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex items-center justify-center text-xl font-bold">
            Atur Lokasi Instansi Anda
          </div>

          <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium text-gray-700">
              Name
            </label>
            <div className="relative">
              <input
                disabled={userInfo?.full_name !== null}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 bg-gray-200 text-gray-500 py-4 pl-3 pr-10 outline-none cursor-not-allowed"
              />
              <span className="absolute right-4 top-4 text-gray-500">
                <PersonOutline />
              </span>
            </div>
          </div>

          <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium text-gray-700">
              Latitude, Longitude (Contoh: -6.2238477,106.9694887)
            </label>
            <div className="relative">
              <input
                type="text"
                value={latLong}
                onChange={(e) => setLatLong(e.target.value)}
                placeholder="Enter your (latitude, longitude)"
                className="w-full rounded-lg border border-gray-300 bg-transparent py-4 pl-3 pr-10 text-black outline-none focus:border-primary"
              />
              <span className="absolute right-4 top-4 text-gray-500">
                <MapOutlined />
              </span>
            </div>
          </div>

          <button className="mb-5 w-full" disabled={loading}>
            <div
              className={`w-full text-center cursor-pointer rounded-lg border border-primary ${
                !loading ? "bg-blue-900" : "bg-gray-300"
              } text-white p-4 transition hover:bg-opacity-90`}
            >
              {loading ? "Loading..." : "Simpan"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
