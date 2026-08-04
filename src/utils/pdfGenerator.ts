import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatLiters, formatDate } from './formatters';

export type DateFilterType =
  | 'MONTHLY'
  | 'YEARLY'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

export interface DateFilterRange {
  type: DateFilterType;
  selectedMonth?: number; // 0-indexed (0=Jan)
  selectedYear?: number; // e.g. 2026
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string; // YYYY-MM-DD
}

export const getDateRangeDates = (filter: DateFilterRange): { start: Date; end: Date; label: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let start = new Date(currentYear, currentMonth, 1);
  let end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
  let label = `Monthly Report (${monthNames[currentMonth]} ${currentYear})`;

  switch (filter.type) {
    case 'MONTHLY': {
      const m = filter.selectedMonth !== undefined ? filter.selectedMonth : currentMonth;
      const y = filter.selectedYear !== undefined ? filter.selectedYear : currentYear;
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      label = `Monthly Report (${monthNames[m]} ${y})`;
      break;
    }

    case 'YEARLY': {
      const y = filter.selectedYear !== undefined ? filter.selectedYear : currentYear;
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
      label = `Yearly Annual Report (${y})`;
      break;
    }

    case 'THIS_MONTH': {
      start = new Date(currentYear, currentMonth, 1);
      end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      label = `This Month (${monthNames[currentMonth]} ${currentYear})`;
      break;
    }

    case 'LAST_MONTH': {
      start = new Date(currentYear, currentMonth - 1, 1);
      end = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      label = `Last Month (${monthNames[start.getMonth()]} ${start.getFullYear()})`;
      break;
    }

    case 'CUSTOM': {
      if (filter.customStartDate) {
        start = new Date(filter.customStartDate);
      }
      if (filter.customEndDate) {
        end = new Date(filter.customEndDate);
        end.setHours(23, 59, 59, 999);
      }
      label = `Custom Range (${filter.customStartDate || 'Start'} to ${filter.customEndDate || 'End'})`;
      break;
    }
  }

  return { start, end, label };
};

export const isDateInRange = (dateStr: string | undefined | null, range: { start: Date; end: Date }): boolean => {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  return d >= range.start && d <= range.end;
};

export interface PDFSummaryCard {
  label: string;
  value: string;
}

export interface PDFSection {
  title: string;
  summaryCards?: PDFSummaryCard[];
  headers: string[];
  rows: (string | number)[][];
}

export const generateProfessionalPDF = (
  reportTitle: string,
  dateFilterLabel: string,
  sections: PDFSection[],
  fileNamePrefix: string
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Branding Banner Header
  doc.setFillColor(15, 23, 42); // Deep slate dark blue
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Red accent top line
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BAHU PETROLEUM ENTERPRISE', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Founder & CEO: Mian Rashid Saleem  |  Main Station GT Road', 14, 19);
  doc.text(`Official Business Audit & Operations Report`, 14, 24);

  // 2. Report Details Box
  let currentY = 36;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle.toUpperCase(), 18, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${dateFilterLabel}   |   Generated: ${new Date().toLocaleString()}`, 18, currentY + 12);

  currentY += 22;

  // 3. Render Sections
  sections.forEach((section, index) => {
    // Check page height space
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 15;
    }

    // Section Title
    doc.setFillColor(220, 38, 38);
    doc.rect(14, currentY, 3, 6, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 20, currentY + 4.5);

    currentY += 9;

    // Summary Metric Cards inside section
    if (section.summaryCards && section.summaryCards.length > 0) {
      const cardWidth = (pageWidth - 28 - (section.summaryCards.length - 1) * 3) / section.summaryCards.length;
      section.summaryCards.forEach((card, idx) => {
        const x = 14 + idx * (cardWidth + 3);
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, currentY, cardWidth, 12, 1.5, 1.5, 'FD');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(card.label.toUpperCase(), x + 3, currentY + 4);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text(String(card.value), x + 3, currentY + 9.5);
      });
      currentY += 16;
    }

    // Table Rendering
    if (section.headers.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [section.headers],
        body: section.rows.length > 0 ? section.rows : [['No records found for this period', ...Array(section.headers.length - 1).fill('')]],
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59], // Slate 800
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
        styles: {
          cellPadding: 2,
          overflow: 'linebreak',
        },
      });

      // Update currentY after table
      currentY = (doc as any).lastAutoTable.finalY + 8;
    } else {
      currentY += 4;
    }
  });

  // Page numbering and footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    doc.text(`Bahu Petroleum Enterprise System  |  Confidential Financial & Operations Audit`, 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 7);
  }

  // Trigger Save & Dispatch PDF Export Event for Open/Share feedback
  const sanitizedTitle = fileNamePrefix.replace(/[^a-zA-Z0-9_]/g, '_');
  const dateTag = new Date().toISOString().slice(0, 10);
  const fullFileName = `Bahu_Petroleum_${sanitizedTitle}_${dateTag}.pdf`;

  doc.save(fullFileName);

  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pdf_exported', {
          detail: {
            title: reportTitle,
            fileName: fullFileName,
            blob: pdfBlob,
            blobUrl,
          },
        })
      );
    }
  } catch (err) {
    console.error('Error generating PDF Blob for share event:', err);
  }
};
