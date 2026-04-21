
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCGPA } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/exportUtils';

const CGPASummary = () => {
  const { calculateCGPA, state } = useCGPA();
  const { toast } = useToast();
  const { courses } = state;

  const { totalCredits, totalPoints, cgpa } = calculateCGPA();

  // Function to determine CGPA class
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
      toast({
        title: "No Data to Export",
        description: "Please add some courses before exporting.",
      });
      return;
    }

    generatePDF(courses, { totalCredits, totalPoints, cgpa });
    toast({
      title: "PDF Generated",
      description: "Your CGPA report has been downloaded.",
    });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">CGPA Summary</CardTitle>
        <CardDescription>
          CGPA = Total Grade Points / Total Credit Units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Credits</div>
              <div className="text-2xl font-bold">{totalCredits}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-2xl font-bold">{totalPoints}</div>
            </div>
          </div>

          <div className="bg-primary/10 p-6 rounded-lg text-center">
            <div className="text-sm text-primary mb-1">Your CGPA</div>
            <div className="text-4xl font-bold text-primary">{cgpa}</div>
            <div className="text-sm mt-2 font-medium">{getCGPAClass(cgpa)}</div>
          </div>
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
