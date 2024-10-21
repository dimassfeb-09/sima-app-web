import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { Users } from "../types/user";
import {
  fetchReportsByOrganizationId,
  updateReportOrganization,
  updateReportStatus,
} from "../models/report";
import {
  fetchOrganization,
  fetchOrganizationByUserId,
} from "../models/organizations";
import Badge from "../components/Badge";
import ReportDetailModal from "../components/ReportDetailModal";
import { Assignment } from "../types/assignment";
import useNewReportListener from "../helpers/listeners _new_report";
import { toast } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmDialog";
import { Organization } from "../types/organization";
import DropdownSearch from "../components/DropdownSearch";

export default function ReportPage({ userInfo }: { userInfo: Users | null }) {
  const [reports, setReports] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [organizations, setOrganizations] = useState<Organization[] | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [openDialogTransferReport, setOpenDialogTransferReport] =
    useState<boolean>(false);
  const [selectedTransferOrg, setSelectedTransferOrg] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedTransferReportId, setSelectedTransferReportId] = useState<
    number | null
  >(null);

  const fetchReports = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      if (organization.id) {
        const reportsResponse = await fetchReportsByOrganizationId(
          organization.id
        );
        setReports(reportsResponse || []);
      } else {
        console.error("ID organisasi tidak valid");
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrganizationDetail = async () => {
      if (!userInfo?.id) return;

      try {
        const orgResponse = await fetchOrganizationByUserId(userInfo.id);
        if (orgResponse?.data) {
          setOrganization(orgResponse?.data);
        }
      } catch (error) {
        console.error("Failed to fetch organization", error);
      }
    };

    const fetchOrganizations = async () => {
      try {
        const orgResponse = await fetchOrganization();
        if (orgResponse?.data) {
          setOrganizations(orgResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch organization", error);
      }
    };

    fetchOrganizations();
    fetchOrganizationDetail();
  }, [userInfo]);

  useEffect(() => {
    if (organization) {
      fetchReports();
    }
  }, [organization]);

  useNewReportListener({
    organizationId: organization?.id!,
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

  // Transfer confirmation handling
  const handleTransferConfirmation = async () => {
    if (selectedTransferOrg && selectedTransferReportId !== null) {
      try {
        await updateReportOrganization(
          selectedTransferReportId,
          selectedTransferOrg.id
        );

        setReports((prevReports) =>
          prevReports.filter((report) => report.id != selectedTransferReportId)
        );

        toast.success(`Laporan telah dialihkan ke ${selectedTransferOrg.name}`);
      } catch (error) {
        // Handle any errors that occurred during the update
        console.error("Error during report transfer:", error);
        toast.error(
          "Terjadi kesalahan saat memindahkan laporan. Silakan coba lagi."
        );
      } finally {
        // This block will run regardless of whether an error occurred or not
        setOpenDialogTransferReport(false);
        setSelectedTransferOrg(null); // Reset the selected organization if needed
        setSelectedTransferReportId(null); // Reset the selected report ID
      }
    }
  };

  const cancelTransfer = () => {
    setOpenDialogTransferReport(false);
    setSelectedTransferOrg(null); // Reset the selected organization if needed
    setSelectedTransferReportId(null);
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
          message={`Apakah anda yakin ingin mengubah status menjadi ${newStatus}?`}
          onConfirm={confirmStatusChange}
          onCancel={cancelStatusChange}
        />
      )}

      {openDialogTransferReport && (
        <ConfirmationDialog
          isOpen={openDialogTransferReport}
          message={`Apakah anda yakin ingin memindahkan laporan ini ke ${selectedTransferOrg?.name}?`}
          onConfirm={handleTransferConfirmation}
          onCancel={cancelTransfer}
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
                <th className="px-6 py-3 border-r border-b border-gray-300">
                  Alih Laporan
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
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
                      <td
                        className="px-6 py-4 border-r border-b"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                        }}
                      >
                        <DropdownSearch
                          options={
                            organizations
                              ?.filter(
                                (org) =>
                                  org.id !== undefined &&
                                  org.instance_type ===
                                    organization?.instance_type
                              )
                              .map((org) => ({
                                id: org.id as number, // Ensure id is a number
                                name: org.name,
                              })) || []
                          }
                          selectedOption={{
                            id: item.organizations.id!,
                            name: item.organizations.name,
                          }} // Pass the current organization
                          onSelectionChange={(selected) => {
                            setSelectedTransferOrg(selected);
                            setSelectedTransferReportId(item.id);
                            setOpenDialogTransferReport(true);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
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
