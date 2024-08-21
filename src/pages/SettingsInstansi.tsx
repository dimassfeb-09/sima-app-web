import { MapOutlined, PersonOutline } from "@mui/icons-material";
import NavBar from "../components/NavBar";
import { User } from "../types/user";
import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { toast } from "react-toastify";

export default function SettingsInstansi({
  userInfo,
}: {
  userInfo: User | null;
}) {
  const [name, setName] = useState<string>(userInfo?.displayName ?? "");
  const [latLong, setLatLong] = useState<string>("");
  const [instance, setInstance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userInfo?.user_id) {
      const fetchData = async () => {
        const { data: existingRecord, error: fetchError } = await supabase
          .from("location_instance")
          .select("*")
          .eq("user_id", userInfo.user_id)
          .single();

        if (fetchError) {
          toast.error(`Error fetching data: ${fetchError.message}`);
          return;
        }

        if (existingRecord) {
          setName(existingRecord.name || "");
          setLatLong(
            `${existingRecord.latitude || ""}, ${
              existingRecord.longitude || ""
            }`
          );
          setInstance(existingRecord.type_instance || "");
        }
      };

      fetchData();
    }
  }, [userInfo]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const [latitude, longitude] =
        latLong?.split(",")?.map((coord) => coord.trim()) || [];

      if (!latitude || !longitude) {
        throw new Error("Invalid latitude or longitude");
      }

      // Check if an entry with the same user_id already exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from("location_instance")
        .select("*")
        .eq("user_id", userInfo?.user_id)
        .single(); // Use `.single()` to fetch a single record

      if (fetchError) {
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

      if (existingRecord) {
        // If an existing record is found, update it
        const { error: updateError } = await supabase
          .from("location_instance")
          .update({
            name,
            latitude,
            longitude,
            type_instance: instance,
          })
          .eq("user_id", userInfo?.user_id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        toast.success("Data updated successfully!");
      } else {
        // If no existing record is found, insert a new record
        const { error: insertError } = await supabase
          .from("location_instance")
          .insert([
            {
              name,
              latitude,
              longitude,
              user_id: userInfo?.user_id,
              type_instance: instance,
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
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar userInfo={userInfo} />

      <div className="flex items-center justify-center text-xl font-bold mt-20">
        Atur Lokasi Instansi Anda
      </div>

      <div className="flex items-center justify-center mt-10">
        <form
          className="flex flex-col w-full md:w-1/2 px-10 md:px-0 mt-10"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium">Name</label>
            <div className="relative">
              <input
                disabled={userInfo?.displayName !== null}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 bg-gray-200 text-gray-500 py-4 pl-3 pr-10 outline-none cursor-not-allowed"
              />

              <span className="absolute right-4 top-4">
                <PersonOutline />
              </span>
            </div>
          </div>

          <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium">Pilih Instansi</label>
            <div className="relative">
              <select
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-3 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none border-form-strokedark bg-form-input focus:border-primary"
                value={instance}
                onChange={(e) => setInstance(e.target.value)}
              >
                <option value="" disabled>
                  Pilih salah satu instansi
                </option>
                <option value="ambulance">Ambulans / Rumah Sakit</option>
                <option value="police">Polisi</option>
                <option value="firefighter">Pemadam Kebakaran</option>
              </select>
            </div>
          </div>

          <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium">
              Latitude, Longitude (Contoh: -6.2238477,106.9694887)
            </label>
            <div className="relative">
              <input
                type="text"
                value={latLong}
                onChange={(e) => setLatLong(e.target.value)}
                placeholder="Enter your (latitude, longitude)"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-3 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none border-form-strokedark bg-form-input  focus:border-primary"
              />

              <span className="absolute right-4 top-4">
                <MapOutlined />
              </span>
            </div>
          </div>

          <button className="mb-5 w-full" disabled={loading}>
            <div className="w-full text-center cursor-pointer rounded-lg border border-primary bg-blue-900 text-white p-4 transition hover:bg-opacity-90">
              {loading ? "Loading..." : "Simpan "}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
