import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { Users } from "../types/user";
import {
  fetchReportsByOrganizationId,
  updateReportStatus,
} from "../models/report";
import { fetchOrganizationByUserId } from "../models/organizations";
import Badge from "../components/Badge";
import ReportDetailModal from "../components/ReportDetailModal";
import { Assignment } from "../types/assignment";
import useNewReportListener from "../helpers/listeners _new_report";
import { toast } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmDialog";

export default function ReportPage({ userInfo }: { userInfo: Users | null }) {
  const [reports, setReports] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

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

  const handleStatusChange = (reportId: number, newStatus: string) => {
    setCurrentReportId(reportId);
    setNewStatus(newStatus);
    setDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (currentReportId !== null && newStatus) {
      try {
        await updateReportStatus(currentReportId, newStatus);
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === currentReportId
              ? { ...report, status: newStatus }
              : report
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      } catch (error) {
        console.error("Failed to update status", error);
        toast.error("Failed to update status");
      } finally {
        setDialogOpen(false);
      }
    }
  };

  const cancelStatusChange = () => {
    setDialogOpen(false);
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

      {dialogOpen && (
        <ConfirmationDialog
          isOpen={dialogOpen}
          message={`Are you sure you want to set the status to ${newStatus}?`}
          onConfirm={confirmStatusChange}
          onCancel={cancelStatusChange}
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
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Ubah Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
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
                    id,
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
                      <td className="px-6 py-4 border-r border-b border-gray-200">
                        <button
                          className="bg-orange-500 text-white px-2 py-1 rounded mr-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleStatusChange(id, "pending");
                          }}
                        >
                          Pending
                        </button>
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleStatusChange(id, "process");
                          }}
                        >
                          Process
                        </button>
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleStatusChange(id, "success");
                          }}
                        >
                          Success
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleStatusChange(id, "fiktif");
                          }}
                        >
                          Fiktif
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
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
