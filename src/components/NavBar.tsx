import {
  Assignment,
  Computer,
  Logout,
  PersonOutline,
  Settings,
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { toast } from "react-toastify";
import { User } from "../types/user";

const NavBar = ({ userInfo }: { userInfo: User | null }) => {
  const navigate = useNavigate();

  const [profileMenuClicked, setProfileMenuClicked] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Berhasil keluar.");
      navigate("/");
    } catch (error) {
      toast.success(`Terjadi kesalahan ketika keluar. ${error}`);
    }
  };

  return (
    <nav className="block w-full px-6 py-3 mx-auto bg-white border shadow-md border-white/80 bg-opacity-80 backdrop-blur-2xl backdrop-saturate-200">
      <div className="flex items-center justify-between text-blue-gray-900">
        <a
          href="#"
          className="flex gap-2 justify-center items-center mr-4 cursor-pointer py-1.5 font-sans text-base font-semibold leading-relaxed tracking-normal text-inherit antialiased"
        >
          <img
            src="../assets/logo/logo-no-background.png"
            className="h-8 w-h-8"
            alt="Logo"
          />
          SIMA App
        </a>
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
          </ul>
        </div>
        <div className="relative">
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
            className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
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
    </nav>
  );
};

export default NavBar;
