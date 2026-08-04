import React, { useState, useEffect } from 'react';
import { CheckCircle2, FileText, Share2, ExternalLink, X, Download } from 'lucide-react';

export interface PDFExportDetail {
  title: string;
  fileName: string;
  blob: Blob;
  blobUrl: string;
}

export const PDFSuccessModal: React.FC = () => {
  const [exportData, setExportData] = useState<PDFExportDetail | null>(null);

  useEffect(() => {
    const handlePdfExported = (e: Event) => {
      const customEvent = e as CustomEvent<PDFExportDetail>;
      if (customEvent.detail) {
        setExportData(customEvent.detail);
      }
    };

    window.addEventListener('pdf_exported', handlePdfExported);
    return () => {
      window.removeEventListener('pdf_exported', handlePdfExported);
    };
  }, []);

  if (!exportData) return null;

  const handleOpenPdf = () => {
    if (exportData.blobUrl) {
      window.open(exportData.blobUrl, '_blank');
    }
  };

  const handleSharePdf = async () => {
    if (!exportData.blob) return;

    try {
      const file = new File([exportData.blob], exportData.fileName, {
        type: 'application/pdf',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: exportData.title,
          text: `PDF Statement Report: ${exportData.title} - Bahu Petroleum Enterprise`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: exportData.title,
          url: exportData.blobUrl,
        });
      } else {
        window.open(exportData.blobUrl, '_blank');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing PDF:', err);
        window.open(exportData.blobUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">PDF Exported Successfully</h3>
              <p className="text-xs text-slate-500">Saved to Downloads / Documents folder</p>
            </div>
          </div>
          <button
            onClick={() => setExportData(null)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="truncate">{exportData.fileName}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The document has been compiled and saved to your device. Choose an option below:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleOpenPdf}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            Open PDF
          </button>

          <button
            type="button"
            onClick={handleSharePdf}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-900/20 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share PDF
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> PDF exported successfully.
          </span>
          <button
            type="button"
            onClick={() => setExportData(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
