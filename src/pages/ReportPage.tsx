import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { User } from "../types/user";
import { fetchReportsByOrganizationId } from "../models/report";
import { fetchOrganizationByUserId } from "../models/organizations";
import Badge from "../components/Badge";

export default function ReportPage({ userInfo }: { userInfo: User | null }) {
  const [reports, setReports] = useState<any[]>([]); // Define type according to your report structure
  const [selectedReport, setSelectedReport] = useState<any | null>(null); // State to manage selected report
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to manage modal visibility

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo?.user_id) {
        try {
          // Fetch organization ID based on user ID
          const orgResponse = await fetchOrganizationByUserId(userInfo.user_id);
          if (orgResponse?.data) {
            const organizationId = orgResponse.data.id;
            const reportsResponse = await fetchReportsByOrganizationId(
              organizationId!
            );
            setReports(reportsResponse || []);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      }
    };

    fetchData();
  }, [userInfo]);

  const handleRowClick = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen">
      <NavBar userInfo={userInfo} />

      {/* Modal */}
      {isModalOpen && (
        <div
          id="default-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            target.className = "cursor-pointer";
            if (target.id === "default-modal") {
              handleCloseModal();
            }
          }}
        >
          <div className=" p-4 w-3/4" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-white h-full rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900">
                  Report Details
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={handleCloseModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="md:p-5 space-y-4">
                {selectedReport ? (
                  <div className="p-3">
                    <div className="relative overflow-x-auto border-2 sm:rounded-lg">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              KETERANGAN
                            </th>
                            <th scope="col" className="px-6 py-3">
                              ISI
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Judul</td>
                            <td className="px-6 py-4">
                              {selectedReport.reports.title}
                            </td>
                          </tr>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Deskripsi</td>
                            <td className="px-6 py-4">
                              {selectedReport.reports.description}
                            </td>
                          </tr>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Status</td>
                            <td className="px-6 py-4">
                              {" "}
                              <Badge status={selectedReport.status} />
                            </td>
                          </tr>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Titik Kejadian</td>
                            <td className="px-6 py-4 flex items-center gap-2">
                              <div>
                                {selectedReport.reports.latitude},
                                {selectedReport.reports.longitude}
                              </div>
                              <a
                                className="bg-blue-500 px-3 py-1 text-white rounded-sm hover:bg-blue-600"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
                                  selectedReport.reports.latitude
                                )},${encodeURIComponent(
                                  selectedReport.reports.longitude
                                )}`}
                              >
                                Lihat
                              </a>
                            </td>
                          </tr>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Dibuat</td>
                            <td className="flex px-6 py-4">
                              {selectedReport.assigned_at}
                            </td>
                          </tr>
                          <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-6 py-4">Jarak</td>
                            <td className="px-6 py-4">
                              {selectedReport.distance} Km
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 sm:px-10 pt-5">
        <div className=" h-[49rem] overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  #
                </th>
                <th scope="col" className="px-6 py-3">
                  Report Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Dibuat
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Jarak
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item, index) => {
                const report = item.reports;
                const status = item.status;
                const distance = item.distance;
                const assigned_at = item.assigned_at;
                return (
                  <tr
                    key={index}
                    className="odd:bg-white hover:bg-gray-200 even:bg-gray-50 border-b cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{report.title}</td>
                    <td className="px-6 py-4">{assigned_at}</td>
                    <td className="px-6 py-4">{<Badge status={status} />}</td>
                    <td className="px-6 py-4">{distance} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
