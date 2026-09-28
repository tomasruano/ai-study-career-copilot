import { Document, Page } from "react-pdf";

export default function PdfViewer({
  pdfFile,
  selectedPage
}) {
  return (
    <div className="w-1/2 bg-slate-950 overflow-auto">

      {!pdfFile ? (
        <div className="h-full flex items-center justify-center text-slate-500">
          No PDF loaded
        </div>
      ) : (
        <div className="p-6 flex justify-center">

          <Document
            file={pdfFile}
            loading={
              <div className="text-slate-400">
                Loading PDF...
              </div>
            }
            error={
              <div className="text-red-400">
                Failed to load PDF
              </div>
            }
          >
            <Page
              pageNumber={selectedPage}
              width={650}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

        </div>
      )}

    </div>
  );
}