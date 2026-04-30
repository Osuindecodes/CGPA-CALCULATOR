
import { Course, gradePoints, YearNum } from '@/context/CGPAContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface CGPASummaryData {
  totalCredits: number;
  totalPoints: number;
  cgpa: number;
}

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => any;
  lastAutoTable: { finalY: number };
}

// Teal primary colour
const PRIMARY: [number, number, number] = [13, 148, 136];
const PRIMARY_LIGHT: [number, number, number] = [204, 241, 238];
const GREY: [number, number, number] = [100, 116, 139];
const DARK: [number, number, number] = [15, 23, 42];

const getCGPAClass = (v: number) => {
  if (v >= 4.5) return 'First Class';
  if (v >= 3.5) return 'Second Class Upper';
  if (v >= 2.5) return 'Second Class Lower';
  if (v >= 1.5) return 'Third Class';
  if (v > 0)   return 'Pass';
  return 'N/A';
};

const calcGPA = (courses: Course[]) => {
  const totalCredits = courses.reduce((s, c) => s + c.creditUnits, 0);
  const totalPoints  = courses.reduce((s, c) => s + c.creditUnits * gradePoints[c.grade], 0);
  const cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
  return { totalCredits, totalPoints, cgpa };
};

export const generatePDF = (courses: Course[], summary: CGPASummaryData) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Cover header ────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CGPA Academic Report', pageW / 2, 13, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, 22, { align: 'center' });

  doc.setTextColor(...DARK);
  y = 42;

  // ── Collect active years ─────────────────────────────────────────────────────
  const activeYears = ([1,2,3,4,5,6] as YearNum[]).filter(yr =>
    courses.some(c => c.year === yr)
  );

  // ── Per-year sections ────────────────────────────────────────────────────────
  activeYears.forEach((yr, idx) => {
    const yearCourses = courses.filter(c => c.year === yr);

    // Year heading bar
    doc.setFillColor(...PRIMARY_LIGHT);
    doc.roundedRect(14, y, pageW - 28, 9, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text(`YEAR ${yr}`, 18, y + 6.2);
    doc.setTextColor(...DARK);
    y += 14;

    // Semester 1 & 2
    ([1, 2] as const).forEach(sem => {
      const semCourses = yearCourses.filter(c => c.semester === sem);
      if (semCourses.length === 0) return;

      const { totalCredits, totalPoints, cgpa } = calcGPA(semCourses);

      // Semester sub-heading
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREY);
      doc.text(`Semester ${sem}`, 16, y);
      doc.setTextColor(...DARK);
      y += 3;

      // Course table
      doc.autoTable({
        startY: y,
        margin: { left: 14, right: 14 },
        head: [['Course Name', 'Credits', 'Grade', 'Grade Pts', 'Weighted Pts']],
        body: [
          ...semCourses.map(c => [
            c.name,
            c.creditUnits,
            c.grade,
            gradePoints[c.grade],
            c.creditUnits * gradePoints[c.grade],
          ]),
          // Semester summary row
          [{ content: `Semester ${sem} GPA`, styles: { fontStyle: 'bold', textColor: PRIMARY } },
           { content: String(totalCredits), styles: { fontStyle: 'bold' } },
           '',
           { content: String(totalPoints), styles: { fontStyle: 'bold' } },
           { content: String(cgpa), styles: { fontStyle: 'bold', textColor: PRIMARY } }],
        ],
        headStyles: {
          fillColor: PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 26, halign: 'center' },
        },
      });

      y = doc.lastAutoTable.finalY + 14;
    });

    // Year summary box
    const { totalCredits: yc, totalPoints: yp, cgpa: ygpa } = calcGPA(yearCourses);
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(14, y, pageW - 28, 12, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Year ${yr} Summary`, 18, y + 4.5);
    doc.text(`Total Credits: ${yc}`, 70, y + 4.5);
    doc.text(`Total Points: ${yp}`, 110, y + 4.5);
    doc.text(`Year GPA: ${ygpa}`, 155, y + 4.5);
    doc.setTextColor(...DARK);
    y += 18;

    // Page break between years (not after last)
    if (idx < activeYears.length - 1 && y > 230) {
      doc.addPage();
      y = 20;
    }
  });

  // ── Cumulative CGPA footer ───────────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20; }

  y += 4;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageW - 14, y);
  y += 10;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(14, y, pageW - 28, 28, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CUMULATIVE GPA (CGPA)', pageW / 2, y + 8, { align: 'center' });

  doc.setFontSize(18);
  doc.text(String(summary.cgpa), pageW / 2, y + 19, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(getCGPAClass(summary.cgpa), pageW / 2, y + 26, { align: 'center' });

  doc.setTextColor(...DARK);
  y += 36;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...GREY);
  doc.text(
    `Formula: CGPA = Total Weighted Points ÷ Total Credit Units  |  Total Credits: ${summary.totalCredits}  |  Total Points: ${summary.totalPoints}`,
    pageW / 2, y, { align: 'center' }
  );

  doc.save('CGPA_Report.pdf');
};

export const exportToCSV = (courses: Course[], summary: CGPASummaryData) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx');

  const wb = XLSX.utils.book_new();
  const activeYears = ([1,2,3,4,5,6] as YearNum[]).filter(yr => courses.some(c => c.year === yr));

  const COLS = ['A','B','C','D','E','F','G'];
  const COL_HEADERS = ['Course Name','Credit Units','Grade','Grade Points','Weighted Points','',''];

  // helper: set a cell value + optional style tag (stored in cell comment for reference)
  const setCell = (ws: any, addr: string, value: any, bold = false, bg?: string, align?: string) => {
    ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's' };
    if (bold || bg || align) {
      ws[addr].s = {
        font: bold ? { bold: true, color: { rgb: bg === '0D9488' ? 'FFFFFF' : '0F172A' } } : { color: { rgb: '0F172A' } },
        fill: bg ? { fgColor: { rgb: bg }, patternType: 'solid' } : undefined,
        alignment: { horizontal: align ?? 'left', vertical: 'center', wrapText: true },
        border: {
          top:    { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
          left:   { style: 'thin', color: { rgb: 'CBD5E1' } },
          right:  { style: 'thin', color: { rgb: 'CBD5E1' } },
        },
      };
    }
  };

  const wsData: any = { '!merges': [], '!rows': [], '!cols': [
    { wch: 40 }, // Course Name
    { wch: 14 }, // Credit Units
    { wch: 10 }, // Grade
    { wch: 14 }, // Grade Points
    { wch: 16 }, // Weighted Points
    { wch: 5  },
    { wch: 5  },
  ]};

  let row = 1;

  // ── Title row ──────────────────────────────────────────────────────────────
  setCell(wsData, `A${row}`, 'CGPA ACADEMIC REPORT', true, '0D9488', 'center');
  for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', false, '0D9488', 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 28 });
  row++;

  // ── Date row ───────────────────────────────────────────────────────────────
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  setCell(wsData, `A${row}`, `Generated on ${dateStr}`, false, 'CCF1EE', 'center');
  for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', false, 'CCF1EE', 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 18 });
  row++;

  // blank spacer
  wsData['!rows'].push({ hpt: 10 });
  row++;

  // ── Per-year sections ──────────────────────────────────────────────────────
  activeYears.forEach(yr => {
    const yearCourses = courses.filter(c => c.year === yr);

    // Year heading
    setCell(wsData, `A${row}`, `YEAR ${yr}`, true, 'CCF1EE', 'left');
    for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', true, 'CCF1EE');
    wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
    wsData['!rows'].push({ hpt: 20 });
    row++;

    ([1, 2] as const).forEach(sem => {
      const semCourses = yearCourses.filter(c => c.semester === sem);
      if (semCourses.length === 0) return;

      const { totalCredits, totalPoints, cgpa } = calcGPA(semCourses);

      // Semester sub-heading
      setCell(wsData, `A${row}`, `Semester ${sem}`, true, 'E2F8F6', 'left');
      for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', true, 'E2F8F6');
      wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
      wsData['!rows'].push({ hpt: 18 });
      row++;

      // Column headers
      COL_HEADERS.slice(0,5).forEach((h, i) => {
        setCell(wsData, `${COLS[i]}${row}`, h, true, '0D9488', 'center');
      });
      wsData['!rows'].push({ hpt: 16 });
      row++;

      // Course rows
      semCourses.forEach(c => {
        setCell(wsData, `A${row}`, c.name, false, undefined, 'left');
        setCell(wsData, `B${row}`, c.creditUnits, false, undefined, 'center');
        setCell(wsData, `C${row}`, c.grade, false, undefined, 'center');
        setCell(wsData, `D${row}`, gradePoints[c.grade], false, undefined, 'center');
        setCell(wsData, `E${row}`, c.creditUnits * gradePoints[c.grade], false, undefined, 'center');
        wsData['!rows'].push({ hpt: 15 });
        row++;
      });

      // Semester GPA summary row
      setCell(wsData, `A${row}`, `Semester ${sem} GPA`, true, 'CCF1EE', 'left');
      setCell(wsData, `B${row}`, totalCredits, true, 'CCF1EE', 'center');
      setCell(wsData, `C${row}`, '', true, 'CCF1EE', 'center');
      setCell(wsData, `D${row}`, totalPoints, true, 'CCF1EE', 'center');
      setCell(wsData, `E${row}`, cgpa, true, 'CCF1EE', 'center');
      wsData['!rows'].push({ hpt: 16 });
      row++;

      // spacer between semesters
      wsData['!rows'].push({ hpt: 8 });
      row++;
    });

    // Year summary row
    const { totalCredits: yc, totalPoints: yp, cgpa: ygpa } = calcGPA(yearCourses);
    setCell(wsData, `A${row}`, `Year ${yr} Summary`, true, '0D9488', 'left');
    setCell(wsData, `B${row}`, `Credits: ${yc}`, true, '0D9488', 'center');
    setCell(wsData, `C${row}`, `Points: ${yp}`, true, '0D9488', 'center');
    setCell(wsData, `D${row}`, `Year GPA: ${ygpa}`, true, '0D9488', 'center');
    setCell(wsData, `E${row}`, '', true, '0D9488', 'center');
    wsData['!rows'].push({ hpt: 18 });
    row++;

    // spacer between years
    wsData['!rows'].push({ hpt: 12 });
    row++;
  });

  // ── Cumulative CGPA ────────────────────────────────────────────────────────
  setCell(wsData, `A${row}`, 'CUMULATIVE GPA (CGPA)', true, '0D9488', 'center');
  for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', true, '0D9488', 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 20 });
  row++;

  setCell(wsData, `A${row}`, summary.cgpa, true, 'CCF1EE', 'center');
  for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', true, 'CCF1EE', 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 24 });
  row++;

  setCell(wsData, `A${row}`, getCGPAClass(summary.cgpa), true, 'CCF1EE', 'center');
  for (const col of ['B','C','D','E']) setCell(wsData, `${col}${row}`, '', true, 'CCF1EE', 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 18 });
  row++;

  // formula note
  row++;
  setCell(wsData, `A${row}`, `Formula: CGPA = Total Weighted Points ÷ Total Credit Units   |   Total Credits: ${summary.totalCredits}   |   Total Points: ${summary.totalPoints}`, false, undefined, 'center');
  wsData['!merges'].push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });
  wsData['!rows'].push({ hpt: 14 });

  // set sheet ref range
  wsData['!ref'] = `A1:E${row}`;

  XLSX.utils.book_append_sheet(wb, wsData, 'CGPA Report');
  XLSX.writeFile(wb, 'CGPA_Report.xlsx');
};
