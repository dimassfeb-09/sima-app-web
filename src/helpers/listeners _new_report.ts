import { useCallback, useEffect } from "react";
import supabase from "../utils/supabase";

interface UseNewReportListenerProps {
  organizationId: number;
  onNewReport?: () => void;
}

const useNewReportListener = ({organizationId, onNewReport}: UseNewReportListenerProps) => {
  const createNewReportSubscription = useCallback(() => {
    if (organizationId === null) return;

    const channel = supabase.channel(`report-${organizationId}`);

    channel
      .on("broadcast", { event: "new-report" }, (_) => {
        if (onNewReport) {
          onNewReport();
        }
      })
      .subscribe();

    return channel;
  }, [organizationId, onNewReport]);

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
