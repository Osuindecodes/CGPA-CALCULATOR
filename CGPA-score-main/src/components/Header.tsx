
import React from 'react';
import { ModeToggle } from './ModeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCGPA } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Redo, Save, Undo } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';

const Header = () => {
  const { state, undo, redo, resetAll, canUndo, canRedo, calculateCGPA } = useCGPA();
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (state.courses.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please add some courses before exporting.",
      });
      return;
    }

    const { totalCredits, totalPoints, cgpa } = calculateCGPA();
    exportToCSV(state.courses, { totalCredits, totalPoints, cgpa });
    
    toast({
      title: "CSV Generated",
      description: "Your CGPA report has been downloaded as CSV.",
    });
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-2">CGPA Tracker</h1>
          <div className="ml-6 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-1"
          >
            <Save className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Reset All
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
