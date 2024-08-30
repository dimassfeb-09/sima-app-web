import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { Users } from "../types/user";
import { fetchReportsByOrganizationId } from "../models/report";
import { fetchOrganizationByUserId } from "../models/organizations";
import Badge from "../components/Badge";
import ReportDetailModal from "../components/ReportDetailModal";
import { Assignment } from "../types/assignment";
import useNewReportListener from "../helpers/listeners _new_report";
import { toast } from "react-toastify";

export default function ReportPage({ userInfo }: { userInfo: Users | null }) {
  const [reports, setReports] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  const fetchReports = async () => {
    if (!organizationId) return;

    setLoading(true);

    try {
      const reportsResponse = await fetchReportsByOrganizationId(
        organizationId
      );
      setReports(reportsResponse || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!userInfo?.id) return;

      try {
        const orgResponse = await fetchOrganizationByUserId(userInfo.id);
        if (orgResponse?.data) {
          const fetchedOrganizationId = orgResponse.data.id;
          setOrganizationId(fetchedOrganizationId!);
        }
      } catch (error) {
        console.error("Failed to fetch organization", error);
      }
    };

    fetchOrganization();
  }, [userInfo]);

  useEffect(() => {
    if (organizationId) {
      fetchReports();
    }
  }, [organizationId]);

  useNewReportListener({
    organizationId: organizationId!,
    onNewReport: () => {
      fetchReports();
      toast.success("Ada laporan baru");
    },
  });

  const handleRowClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen">
      <NavBar userInfo={userInfo} />

      {isModalOpen && selectedAssignment && (
        <ReportDetailModal
          assignment={selectedAssignment}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      <div className="px-5 sm:px-10 pt-5">
        <div className="h-[49rem] overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 border-separate border-spacing-0 border border-gray-200">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  #
                </th>
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Report Title
                </th>
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Dibuat
                </th>
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Jarak
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center border-t border-gray-200"
                  >
                    Loading...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((item, index) => {
                  const {
                    reports: report,
                    status,
                    distance,
                    assigned_at,
                  } = item;
                  return (
                    <tr
                      key={index}
                      className="odd:bg-white hover:bg-gray-200 even:bg-gray-50 border-t border-gray-200 cursor-pointer"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-6 py-4 border-r border-b border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 border-r border-b border-gray-200">
                        {report.title}
                      </td>
                      <td className="px-6 py-4 border-r border-b border-gray-200">
                        {assigned_at}
                      </td>
                      <td className="px-6 py-4 border-r border-b border-gray-200">
                        <Badge status={status} />
                      </td>
                      <td className="px-6 py-4 border-r border-b">
                        {distance.toFixed(2)} km
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center border-t border-gray-200"
                  >
                    No reports available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
