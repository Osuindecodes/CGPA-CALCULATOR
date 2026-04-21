
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCGPA, Course, gradePoints } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';

const CourseItem: React.FC<{ course: Course }> = ({ course }) => {
  const { removeCourse } = useCGPA();
  const { toast } = useToast();

  const handleRemove = () => {
    removeCourse(course.id);
    toast({
      title: "Course Removed",
      description: `${course.name} has been removed from your course list.`,
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-card animate-slide-in shadow-sm card-hover">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate" title={course.name}>{course.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {course.creditUnits} {course.creditUnits === 1 ? 'Credit' : 'Credits'} • Grade: {course.grade} ({gradePoints[course.grade]}.0)
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleRemove}
        className="ml-2 text-destructive hover:bg-destructive/10"
        aria-label={`Remove ${course.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const CourseList = () => {
  const { state, resetAll } = useCGPA();
  const { toast } = useToast();
  const { courses } = state;

  const handleResetAll = () => {
    if (courses.length === 0) {
      toast({
        title: "No Courses",
        description: "There are no courses to reset.",
      });
      return;
    }
    
    resetAll();
    toast({
      title: "All Courses Reset",
      description: "All courses have been removed.",
      variant: "destructive"
    });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Course List</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResetAll}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          aria-label="Reset all courses"
        >
          Reset All
        </Button>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No courses added yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add courses using the form above.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[280px] pr-1">
            {courses.map(course => (
              <CourseItem key={course.id} course={course} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseList;
