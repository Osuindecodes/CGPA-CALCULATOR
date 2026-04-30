
import React, { useEffect, useState } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleExportCSV = () => {
    if (state.courses.length === 0) {
      toast({ title: "No Data to Export", description: "Please add some courses before exporting." });
      return;
    }
    const { totalCredits, totalPoints, cgpa } = calculateCGPA();
    exportToCSV(state.courses, { totalCredits, totalPoints, cgpa });
    toast({ title: "Excel Generated", description: "Your CGPA report has been downloaded as Excel." });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 animate-slide-down border-b transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-lg shadow-black/5'
          : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-2 transition-all duration-300">
            CGPA Calculator
          </h1>
          <div className="ml-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              className="transition-all duration-200 hover:scale-110 disabled:opacity-30"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              className="transition-all duration-200 hover:scale-110 disabled:opacity-30"
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
            className="hidden sm:flex items-center gap-1 transition-all duration-200 hover:scale-105"
          >
            <Save className="h-4 w-4 mr-1" />
            Export Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="text-destructive border-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
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
