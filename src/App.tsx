import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingPage from "./pages/LoadingPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsInstansi from "./pages/SettingsInstansi";

import ProtectedRoute from "./components/ProtectedRoute";

import { auth } from "./utils/firebase";

import { getUserInfo } from "./models/user";
import { fetchOrganizationByUserId } from "./models/organizations";

import ReportPage from "./pages/ReportPage";
import MapsReportPage from "./pages/MapsReportPage";
import { Users } from "./types/user";
import useNewReportListener from "./helpers/listeners _new_report";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<Users | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const fetchedUserInfo = await getUserInfo();
          setUserInfo(fetchedUserInfo);
        } catch (error) {
          console.error("Failed to fetch user info", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch organization based on user info
  useEffect(() => {
    const fetchOrganization = async () => {
      if (userInfo?.id) {
        try {
          const response = await fetchOrganizationByUserId(userInfo.id);
          if (response?.data) {
            setOrganizationId(response.data.id!);
          }
        } catch (error) {
          console.error("Failed to fetch organization", error);
        }
      }
    };

    fetchOrganization();
  }, [userInfo]);

  useNewReportListener({
    organizationId: organizationId!,
    showingToast: true,
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
          <Route path="/" element={<HomePage userInfo={userInfo} />} />
          <Route path="/report" element={<ReportPage userInfo={userInfo} />} />
          <Route
            path="/report_maps"
            element={<MapsReportPage userInfo={userInfo} />}
          />

          <Route
            path="/settings/instansi"
            element={<SettingsInstansi userInfo={userInfo} />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
