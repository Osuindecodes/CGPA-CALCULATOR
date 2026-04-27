
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCGPA, Course } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';

const CourseForm = () => {
  const { addCourse, state, setActiveSemester } = useCGPA();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [creditUnits, setCreditUnits] = useState<number | ''>('');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | ''>('');
  const [nameError, setNameError] = useState('');
  const [creditError, setCreditError] = useState('');
  const [gradeError, setGradeError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Course name is required');
      isValid = false;
    } else if (name.length > 50) {
      setNameError('Course name must not exceed 50 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    if (creditUnits === '') {
      setCreditError('Credit units are required');
      isValid = false;
    } else if (typeof creditUnits === 'number' && (creditUnits < 1 || creditUnits > 9 || !Number.isInteger(creditUnits))) {
      setCreditError('Credit units must be a whole number between 1 and 9');
      isValid = false;
    } else {
      setCreditError('');
    }

    if (grade === '') {
      setGradeError('Grade is required');
      isValid = false;
    } else {
      setGradeError('');
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: name.trim(),
        creditUnits: typeof creditUnits === 'number' ? creditUnits : 0,
        grade: grade as 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
        semester: state.activeSemester,
      };

      addCourse(newCourse);
      toast({
        title: "Course Added",
        description: `${name} has been added to Semester ${state.activeSemester}.`,
      });

      setName('');
      setCreditUnits('');
      setGrade('');
    }
  };

  const handleCreditUnitsChange = (value: string) => {
    if (value === '') {
      setCreditUnits('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 9) {
        setCreditUnits(numValue);
      }
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add New Course</CardTitle>
        <div className="flex gap-2 mt-2">
          {([1, 2] as const).map(sem => (
            <button
              key={sem}
              type="button"
              onClick={() => setActiveSemester(sem)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                state.activeSemester === sem
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Course entry form">
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name*</Label>
            <Input
              id="course-name"
              placeholder="Introduction to Software Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError ? "true" : "false"}
              aria-describedby={nameError ? "course-name-error" : undefined}
              maxLength={50}
              className={nameError ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {nameError && (
              <p id="course-name-error" className="text-sm text-red-400">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-units">Credit Units*</Label>
            <Select 
              value={creditUnits !== '' ? creditUnits.toString() : ''} 
              onValueChange={handleCreditUnitsChange}
            >
              <SelectTrigger 
                id="credit-units" 
                className={creditError ? "border-red-400 focus-visible:ring-red-400" : ""}
                aria-invalid={creditError ? "true" : "false"}
                aria-describedby={creditError ? "credit-units-error" : undefined}
              >
                <SelectValue placeholder="Select credit units" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {creditError && (
              <p id="credit-units-error" className="text-sm text-red-400">{creditError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade*</Label>
            <Select 
              value={grade} 
              onValueChange={(value) => setGrade(value as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}
            >
              <SelectTrigger 
                id="grade" 
                className={gradeError ? "border-red-400 focus-visible:ring-red-400" : ""}
                aria-invalid={gradeError ? "true" : "false"}
                aria-describedby={gradeError ? "grade-error" : undefined}
              >
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A (5.0)</SelectItem>
                <SelectItem value="B">B (4.0)</SelectItem>
                <SelectItem value="C">C (3.0)</SelectItem>
                <SelectItem value="D">D (2.0)</SelectItem>
                <SelectItem value="E">E (1.0)</SelectItem>
                <SelectItem value="F">F (0.0)</SelectItem>
              </SelectContent>
            </Select>
            {gradeError && (
              <p id="grade-error" className="text-sm text-red-400">{gradeError}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add to Semester {state.activeSemester}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
