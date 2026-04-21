
import { Course, gradePoints } from '@/context/CGPAContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface CGPASummary {
  totalCredits: number;
  totalPoints: number;
  cgpa: number;
}

// Define the extended jsPDF type with autoTable support
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => any;
  lastAutoTable: {
    finalY: number;
  };
}

export const generatePDF = (courses: Course[], summary: CGPASummary) => {
  // Cast to our extended type
  const doc = new jsPDF() as JsPDFWithAutoTable;

  // Document title
  doc.setFontSize(20);
  doc.text('CGPA Calculation Report', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

  // Create course data for table
  const courseData = courses.map(course => [
    course.name,
    course.creditUnits,
    course.grade,
    gradePoints[course.grade],
    course.creditUnits * gradePoints[course.grade]
  ]);

  // Create course table
  doc.autoTable({
    startY: 30,
    head: [['Course Name', 'Credits', 'Grade', 'Grade Points', 'Total Points']],
    body: courseData,
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 249] },
  });

  // Add summary section
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.text('CGPA Summary', 14, finalY);
  doc.setFontSize(12);
  
  doc.text(`Total Credit Units: ${summary.totalCredits}`, 14, finalY + 10);
  doc.text(`Total Grade Points: ${summary.totalPoints}`, 14, finalY + 20);
  doc.text(`CGPA = ${summary.cgpa}`, 14, finalY + 30);

  // Explanation of calculation
  doc.setFontSize(10);
  doc.text('Formula: CGPA = Total Grade Points / Total Credit Units', 14, finalY + 45);

  // Grade scale explanation
  doc.setFontSize(12);
  doc.text('Grade Scale:', 14, finalY + 60);
  
  const gradeScale = [
    ['A', '5.0', 'Excellent'],
    ['B', '4.0', 'Very Good'],
    ['C', '3.0', 'Good'],
    ['D', '2.0', 'Pass'],
    ['F', '0.0', 'Fail']
  ];
  
  doc.autoTable({
    startY: finalY + 65,
    head: [['Grade', 'Points', 'Description']],
    body: gradeScale,
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
    margin: { left: 14 },
    styles: { fontSize: 10 },
  });

  // Save the PDF
  doc.save('CGPA_Report.pdf');
};

export const exportToCSV = (courses: Course[], summary: CGPASummary) => {
  // Header row
  let csvContent = 'Course Name,Credit Units,Grade,Grade Points,Total Points\n';
  
  // Data rows
  courses.forEach(course => {
    const totalPoints = course.creditUnits * gradePoints[course.grade];
    csvContent += `${course.name},${course.creditUnits},${course.grade},${gradePoints[course.grade]},${totalPoints}\n`;
  });
  
  // Summary
  csvContent += '\nSummary\n';
  csvContent += `Total Credit Units,${summary.totalCredits}\n`;
  csvContent += `Total Grade Points,${summary.totalPoints}\n`;
  csvContent += `CGPA,${summary.cgpa}\n`;

  // Create a blob and download
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
