import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import supabase from "../utils/supabase";

interface UseNewReportListenerProps {
  organizationId: number;
  fetchReports?: () => void;
  showingToast?: boolean;
}

const useNewReportListener = ({
  organizationId,
  fetchReports,
  showingToast = false,
}: UseNewReportListenerProps) => {
  const createNewReportSubscription = useCallback(() => {
    if (organizationId === null) return;

    const channel = supabase.channel(`report-${organizationId}`);

    channel
      .on("broadcast", { event: "new-report" }, (_) => {
        if (showingToast) {
          toast.success("Terdapat laporan baru");
        }
        if (fetchReports) {
          fetchReports();
        }
      })
      .subscribe();

    return channel;
  }, [organizationId, fetchReports, showingToast]);

  useEffect(() => {
    const channel = createNewReportSubscription();
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [createNewReportSubscription]);
};

export default useNewReportListener;
