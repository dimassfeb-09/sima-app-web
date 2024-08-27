import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingPage from "./pages/LoadingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth } from "./utils/firebase";
import RegisterPage from "./pages/RegisterPage";
import SettingsInstansi from "./pages/SettingsInstansi";
import { getUserInfo } from "./models/user";
import { User } from "./types/user";
import HereMapPage from "./pages/HereMapPage";
import supabase from "./utils/supabase";
import { fetchOrganizationByUserId } from "./models/organizations";
import { Toast } from "./components/Toast";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  // Effect to handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userInfo = await getUserInfo();
          setUserInfo(userInfo);
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

  // Effect to fetch organization based on user info
  useEffect(() => {
    const fetchOrganization = async () => {
      if (userInfo?.user_id) {
        try {
          const response = await fetchOrganizationByUserId(userInfo.user_id);
          if (response?.data) {
            setOrganizationId(response.data.id!);
          }
        } catch (error) {
          console.error("Failed to fetch organizations", error);
        }
      }
    };

    fetchOrganization();
  }, [userInfo]);

  // Effect to handle subscription to new report notifications
  const createNewAnswerSubscription = useCallback(() => {
    if (organizationId === null) return;

    const channel = supabase.channel(`report-${organizationId}`);

    channel
      .on("broadcast", { event: "new-report" }, (payload) => {
        const _payload = payload.payload;
        const reportId = _payload.report_id;
        const title = _payload.title;

        toast.success(<Toast title={title} idReport={reportId} />);
      })
      .subscribe();

    return channel;
  }, [organizationId]);

  useEffect(() => {
    const channel = createNewAnswerSubscription();
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [createNewAnswerSubscription]);

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
