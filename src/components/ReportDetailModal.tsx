import { Close, Phone } from "@mui/icons-material";
import { Assignment } from "../types/assignment";
import Badge from "./Badge";
import { useEffect } from "react";

type ReportDetailModalProps = {
  assignment: Assignment | null;
  setIsModalOpen: (isOpen: boolean) => void;
};

export default function ReportDetailModal({
  assignment,
  setIsModalOpen,
}: ReportDetailModalProps) {
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (assignment) {
      const modalElement = document.getElementById("report-detail-modal");
      modalElement?.focus();
    }
  }, [assignment]);

  return (
    <div
      id="report-detail-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.id === "report-detail-modal") {
          handleCloseModal();
        }
      }}
    >
      <div
        className="h-full w-full m-5 py-5 px-3 sm:px-0 sm:w-3/4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        tabIndex={0}
      >
        <div className="bg-white h-full rounded-lg shadow flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Nama Pelapor:<b> {assignment?.reports.users.full_name}</b>
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={handleCloseModal}
            >
              <Close />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {assignment ? (
              <div className="h-full overflow-x-auto border-2 sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr className="bg-gray-200">
                      <th
                        scope="col"
                        className="px-6 py-3 border-r border-gray-400"
                      >
                        KETERANGAN
                      </th>
                      <th scope="col" className="px-6 py-3">
                        ISI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Judul
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {assignment.reports.title}
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Deskripsi
                      </td>
                      <td className="px-6 py-4">
                        {assignment.reports.description}
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Pelapor
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {assignment.reports.users.full_name}
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Telepon Pelapor
                      </td>
                      <td className="px-6 py-4">
                        {(
                          <div className="flex gap-3 items-center">
                            62{assignment.reports.users.phone}
                            <a
                              href={`tel:62${assignment.reports.users.phone}`}
                              className="py-1 px-2 flex items-center gap-2 bg-blue-500 text-white"
                            >
                              <Phone />
                              Hubungi
                            </a>
                          </div>
                        ) ?? "0"}
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Status
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={assignment.status} />
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Alamat
                      </td>
                      <td className="px-6 py-4">
                        {assignment.reports.address}
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Titik Kejadian
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div>
                          {assignment.reports.latitude},{" "}
                          {assignment.reports.longitude}
                        </div>
                        <a
                          className="bg-blue-500 px-3 py-1 text-white rounded-sm hover:bg-blue-600"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
                            assignment.reports.latitude
                          )},${encodeURIComponent(
                            assignment.reports.longitude
                          )}`}
                        >
                          Lihat
                        </a>
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Dibuat
                      </td>
                      <td className="px-6 py-4">{assignment.assigned_at}</td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Jarak
                      </td>
                      <td className="px-6 py-4">
                        {assignment.distance.toFixed(2)} Km
                      </td>
                    </tr>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-6 py-4 border-r border-gray-300">
                        Gambar
                      </td>
                      <td className="px-6 py-4">
                        {assignment.reports?.image_url ? (
                          <img
                            src={assignment.reports.image_url}
                            alt={assignment.reports.title || "Report Image"}
                            className="object-cover"
                            style={{
                              height: "250px",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>No Image Available</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
