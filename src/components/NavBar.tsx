import {
  Assignment,
  Computer,
  Logout,
  MapOutlined,
  PersonOutline,
  Settings,
  Menu as MenuIcon,
  VolumeUp,
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { toast } from "react-toastify";
import { Users } from "../types/user";
import { fetchOrganizationByUserId } from "../models/organizations";
import useNewReportListener from "../helpers/listeners _new_report";
import { Organization } from "../types/organization";

const NavBar = ({ userInfo }: { userInfo: Users | null }) => {
  const navigate = useNavigate();

  const [profileMenuClicked, setProfileMenuClicked] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationActive, setIsNotificationActive] =
    useState<boolean>(true);
  const [organization, setOrganization] = useState<Organization>();

  useEffect(() => {
    const notificationSetting = localStorage.getItem(
      "is_active_sound_notification"
    );
    setIsNotificationActive(notificationSetting === "true");
  }, []);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (userInfo?.id) {
        try {
          const response = await fetchOrganizationByUserId(userInfo.id);
          if (response?.data) {
            setOrganization(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch organization", error);
        }
      }
    };

    fetchOrganization();
  }, [userInfo]);

  useNewReportListener({
    organizationId: organization?.id!,
    onNewReport: () => {
      toast.success("Terdapat laporan baru");

      if (isNotificationActive) {
        const audio = new Audio(
          `/assets/sound/${organization?.instance_type}.mp3`
        );
        audio.play().catch((error) => {
          console.error("Error playing sound", error);
        });
      }
    },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Berhasil keluar.");
      navigate("/");
    } catch (error) {
      toast.error(`Terjadi kesalahan ketika keluar. ${error}`);
    }
  };

  const toggleNotification = () => {
    const value = !isNotificationActive;
    setIsNotificationActive(value);
    localStorage.setItem("is_active_sound_notification", value.toString());
  };

  return (
    <>
      <nav className="fixed z-50 block w-full px-6 py-3 mx-auto bg-white border shadow-md border-white/80 bg-opacity-80 backdrop-blur-2xl backdrop-saturate-200">
        <div className="flex items-center justify-between text-blue-gray-900">
          <Link
            to="/"
            className="flex gap-2 justify-center items-center mr-4 cursor-pointer py-1.5 font-sans text-base font-semibold leading-relaxed tracking-normal text-inherit antialiased"
          >
            <img
              src="../assets/logo/logo-no-background.png"
              className="h-8 w-h-8"
              alt="Logo"
            />
            SIMA App
          </Link>

          {/* Hamburger Icon */}
          <div className="lg:hidden">
            <button
              className="p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="hidden lg:block">
            <ul className="flex flex-col gap-2 my-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
              <li className="block p-1 font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900">
                <Link
                  to="/"
                  className="flex gap-4 items-center transition-colors hover:text-blue-500"
                >
                  <Computer />
                  Beranda
                </Link>
              </li>

              <li className="block p-1 font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900">
                <Link
                  to="/report"
                  className="flex gap-4 items-center transition-colors hover:text-blue-500"
                >
                  <Assignment />
                  Laporan
                </Link>
              </li>

              <li className="block p-1 font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900">
                <Link
                  to="/report_maps"
                  className="flex gap-4 items-center transition-colors hover:text-blue-500"
                >
                  <MapOutlined />
                  Maps Laporan
                </Link>
              </li>
            </ul>
          </div>

          <div className="relative hidden lg:block">
            <button
              className="relative ml-auto h-8 w-8 rounded-full overflow-hidden border border-gray-300"
              type="button"
              id="profile-menu-button"
              aria-expanded={profileMenuClicked}
              aria-haspopup="true"
              onClick={() => setProfileMenuClicked(!profileMenuClicked)}
            >
              <PersonOutline />
            </button>
            <div
              className={`absolute right-0  mt-2 w-max max-w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                profileMenuClicked ? "" : "hidden"
              }`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="profile-menu-button"
              id="profile-menu"
            >
              <div className="py-1">
                <div
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <PersonOutline />{" "}
                  <span className="font-bold">{userInfo?.full_name}</span>
                </div>

                <Link
                  to={"/settings/instansi"}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Settings /> Atur Instansi
                </Link>

                <div
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <div className="flex justify-between">
                    <div>
                      <VolumeUp /> Sound Notification
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isNotificationActive}
                          onChange={toggleNotification}
                        />
                        <div
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                            isNotificationActive ? "bg-green-500" : "bg-red-500"
                          } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300`}
                        >
                          <div
                            className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                              isNotificationActive
                                ? "transform translate-x-full"
                                : ""
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Logout /> Keluar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        >
          <div className="flex flex-col mt-2 space-y-2">
            <Link
              to="/"
              className="flex gap-4 items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Computer />
              Beranda
            </Link>
            <Link
              to="/report"
              className="flex gap-4 items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Assignment />
              Laporan
            </Link>
            <Link
              to="/report_maps"
              className="flex gap-4 items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapOutlined />
              Maps Laporan
            </Link>
            <Link
              to="/settings/instansi"
              className="flex gap-4 items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings />
              Atur Instansi
            </Link>
            <div
              className="flex gap-4 items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <Logout />
              Keluar
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16"></div>
    </>
  );
};

export default NavBar;
