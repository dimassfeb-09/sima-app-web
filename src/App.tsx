import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingPage from "./pages/LoadingPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsInstansi from "./pages/SettingsInstansi";
import HereMapPage from "./pages/HereMapPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { Toast } from "./components/Toast";

import { auth } from "./utils/firebase";
import supabase from "./utils/supabase";

import { getUserInfo } from "./models/user";
import { fetchOrganizationByUserId } from "./models/organizations";

import { User } from "./types/user";
import ReportPage from "./pages/ReportPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
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
      if (userInfo?.user_id) {
        try {
          const response = await fetchOrganizationByUserId(userInfo.user_id);
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

  // Subscribe to new report notifications
  const createNewReportSubscription = useCallback(() => {
    if (organizationId === null) return;

    const channel = supabase.channel(`report-${organizationId}`);

    channel
      .on("broadcast", { event: "new-report" }, (payload) => {
        const { report_id: reportId, title } = payload.payload;

        toast.success(<Toast title={title} idReport={reportId} />);
      })
      .subscribe();

    return channel;
  }, [organizationId]);

  useEffect(() => {
    const channel = createNewReportSubscription();
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [createNewReportSubscription]);

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/maps" element={<HereMapPage userInfo={userInfo} />} />
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
          <Route path="/" element={<HomePage userInfo={userInfo} />} />
          <Route path="/report" element={<ReportPage userInfo={userInfo} />} />
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
