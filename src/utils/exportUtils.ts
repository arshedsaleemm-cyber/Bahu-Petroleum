import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName = 'Report') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportToCSV = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
  fileName: string
) => {
  const doc = new jsPDF();

  // Header Banner - Bahu Petroleum
  doc.setFillColor(30, 58, 138); // Deep Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BAHU PETROLEUM ENTERPRISE', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Founder & CEO: Mian Rashid Saleem', 14, 22);

  // Document Title & Date
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 44);

  // Table rendering
  let startY = 52;
  const colWidth = 180 / Math.max(headers.length, 1);

  // Table Header
  doc.setFillColor(239, 68, 68); // Red Accent
  doc.rect(14, startY, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  headers.forEach((header, index) => {
    doc.text(String(header), 16 + index * colWidth, startY + 5.5);
  });

  startY += 10;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  rows.forEach((row, rowIndex) => {
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }

    // Alternate row colors
    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY - 2, 182, 7, 'F');
    }

    row.forEach((cell, colIndex) => {
      const cellText = String(cell ?? '');
      doc.text(cellText.length > 25 ? cellText.substring(0, 22) + '...' : cellText, 16 + colIndex * colWidth, startY + 3);
    });

    startY += 7;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} - Confidential Report - Bahu Petroleum`, 14, 288);
  }

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
