
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCGPA, YearNum } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/exportUtils';

const YEARS: YearNum[] = [1, 2, 3, 4, 5, 6];

const CGPASummary = () => {
  const { calculateCGPA, calculateSemesterGPA, state } = useCGPA();
  const { toast } = useToast();
  const { courses } = state;

  const { totalCredits, totalPoints, cgpa } = calculateCGPA();

  const activeYears = YEARS.filter(yr => courses.some(c => c.year === yr));

  const getCGPAClass = (cgpaValue: number): string => {
    if (cgpaValue >= 4.5) return 'First Class';
    if (cgpaValue >= 3.5) return 'Second Class Upper';
    if (cgpaValue >= 2.5) return 'Second Class Lower';
    if (cgpaValue >= 1.5) return 'Third Class';
    if (cgpaValue > 0) return 'Pass';
    return 'N/A';
  };

  const handleExportPDF = () => {
    if (courses.length === 0) {
      toast({ title: 'No Data to Export', description: 'Please add some courses before exporting.' });
      return;
    }
    generatePDF(courses, { totalCredits, totalPoints, cgpa });
    toast({ title: 'PDF Generated', description: 'Your CGPA report has been downloaded.' });
  };

  return (
    <Card className="w-full animate-fade-in flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">CGPA Summary</CardTitle>
        <CardDescription>CGPA = Total Grade Points / Total Credit Units</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">

        {/* Per-year semester breakdown — scrollable so it never overflows */}
        <div className="overflow-y-auto max-h-[220px] pr-1 space-y-2">
          {activeYears.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No courses added yet.</p>
          ) : (
            activeYears.map(yr => {
              const s1 = calculateSemesterGPA(yr, 1);
              const s2 = calculateSemesterGPA(yr, 2);
              return (
                <div key={yr} className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Year {yr}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background/70 p-2 rounded-md text-center">
                      <div className="text-xs text-muted-foreground">Sem 1</div>
                      <div className="text-base font-bold">{s1.cgpa || '—'}</div>
                      <div className="text-xs text-muted-foreground">{s1.totalCredits} cr</div>
                    </div>
                    <div className="bg-background/70 p-2 rounded-md text-center">
                      <div className="text-xs text-muted-foreground">Sem 2</div>
                      <div className="text-base font-bold">{s2.cgpa || '—'}</div>
                      <div className="text-xs text-muted-foreground">{s2.totalCredits} cr</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Total Credits</div>
            <div className="text-xl font-bold">{totalCredits}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Total Points</div>
            <div className="text-xl font-bold">{totalPoints}</div>
          </div>
        </div>

        {/* Overall CGPA */}
        <div className="bg-primary/10 p-4 rounded-lg text-center">
          <div className="text-xs text-primary mb-1">Cumulative GPA (CGPA)</div>
          <div className="text-4xl font-bold text-primary">{cgpa}</div>
          <div className="text-sm mt-1 font-medium">{getCGPAClass(cgpa)}</div>
        </div>

      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export as PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CGPASummary;
