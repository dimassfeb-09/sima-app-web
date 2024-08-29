const Toasts = ({
  idReport,
  title,
}: {
  idReport: string;
  title: string;
}) => (
  <div className="flex flex-col gap-5">
    <div>
      <div>Terdapat laporan baru</div>
      <div className="text-bold">{title}</div>
    </div>
    <a
      className="text-blue-500 underline font-bold"
      href={`http://example.com/report/${idReport}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Lihat laporan
    </a>
  </div>
);


export default Toasts;