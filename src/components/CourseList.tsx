
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCGPA, Course, gradePoints, YearNum } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';

const YEARS: YearNum[] = [1, 2, 3, 4, 5, 6];

const CourseItem: React.FC<{ course: Course }> = ({ course }) => {
  const { removeCourse } = useCGPA();
  const { toast } = useToast();

  const handleRemove = () => {
    removeCourse(course.id);
    toast({ title: 'Course Removed', description: `${course.name} has been removed.` });
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

const SemesterSection: React.FC<{ year: YearNum; semester: 1 | 2; courses: Course[] }> = ({ year, semester, courses }) => {
  const { calculateSemesterGPA } = useCGPA();
  const { cgpa, totalCredits } = calculateSemesterGPA(year, semester);
  const semCourses = courses.filter(c => c.year === year && c.semester === semester);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Semester {semester}</h4>
        {totalCredits > 0 && (
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            GPA: {cgpa}
          </span>
        )}
      </div>
      {semCourses.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1 pl-1">No courses added.</p>
      ) : (
        semCourses.map(course => <CourseItem key={course.id} course={course} />)
      )}
    </div>
  );
};

const YearSection: React.FC<{ year: YearNum; courses: Course[] }> = ({ year, courses }) => {
  const yearCourses = courses.filter(c => c.year === year);
  if (yearCourses.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-foreground mb-3 pb-1 border-b">Year {year}</h3>
      <SemesterSection year={year} semester={1} courses={courses} />
      <SemesterSection year={year} semester={2} courses={courses} />
    </div>
  );
};

const CourseList = () => {
  const { state, resetAll } = useCGPA();
  const { toast } = useToast();
  const { courses } = state;

  const handleResetAll = () => {
    if (courses.length === 0) {
      toast({ title: 'No Courses', description: 'There are no courses to reset.' });
      return;
    }
    resetAll();
    toast({ title: 'All Courses Reset', description: 'All courses have been removed.', variant: 'destructive' });
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
            <p className="text-xs text-muted-foreground mt-1">Select a year and semester above, then add courses.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[480px] pr-1">
            {YEARS.map(yr => (
              <YearSection key={yr} year={yr} courses={courses} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseList;
