export default function UploadBox({
  uploadPDF,
  setFile,
  uploadStatus
}) {
  return (
    <div className="border border-dashed border-slate-700 rounded-2xl p-8 bg-slate-900 mb-6">

      <div className="text-center">

        <h2 className="text-xl font-semibold mb-2">
          Upload your PDF
        </h2>

        <p className="text-slate-400 mb-6">
          Drag & drop or choose a document
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <br />

        <button
          onClick={uploadPDF}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl transition"
        >
          Upload PDF
        </button>

        <p className="text-sm text-slate-400 mt-4">
          {uploadStatus}
        </p>
      </div>
    </div>
  );
}