
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

      y = doc.lastAutoTable.finalY + 6;
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
  let csvContent = 'Year,Semester,Course Name,Credit Units,Grade,Grade Points,Weighted Points\n';

  courses.forEach(course => {
    const weighted = course.creditUnits * gradePoints[course.grade];
    csvContent += `Year ${course.year},Semester ${course.semester},${course.name},${course.creditUnits},${course.grade},${gradePoints[course.grade]},${weighted}\n`;
  });

  csvContent += '\nSummary\n';
  csvContent += `Total Credit Units,${summary.totalCredits}\n`;
  csvContent += `Total Grade Points,${summary.totalPoints}\n`;
  csvContent += `CGPA,${summary.cgpa}\n`;
  csvContent += `Classification,${getCGPAClass(summary.cgpa)}\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'CGPA_Report.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
