import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCGPA, gradePoints, YearNum } from '@/context/CGPAContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const YEARS: YearNum[] = [1, 2, 3, 4, 5, 6];
const TEAL = '#0d9488';
const GRADE_COLORS: Record<string, string> = {
  A: '#0d9488', B: '#14b8a6', C: '#5eead4',
  D: '#f59e0b', E: '#f97316', F: '#ef4444',
};

const getCGPAClass = (v: number) => {
  if (v >= 4.5) return 'First Class';
  if (v >= 3.5) return 'Second Class Upper';
  if (v >= 2.5) return 'Second Class Lower';
  if (v >= 1.5) return 'Third Class';
  if (v > 0) return 'Pass';
  return 'N/A';
};

const CGPAStats = () => {
  const { state, calculateSemesterGPA, calculateCGPA } = useCGPA();
  const { courses } = state;

  if (courses.length === 0) {
    return (
      <Card className="w-full animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">
            Add courses to see your statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const barData = YEARS.flatMap(yr => {
    const s1 = calculateSemesterGPA(yr, 1);
    const s2 = calculateSemesterGPA(yr, 2);
    const results = [];
    if (s1.totalCredits > 0) results.push({ label: `Y${yr}S1`, gpa: s1.cgpa, year: yr, sem: 1 });
    if (s2.totalCredits > 0) results.push({ label: `Y${yr}S2`, gpa: s2.cgpa, year: yr, sem: 2 });
    return results;
  });

  const yearRows = YEARS.map(yr => {
    const yc = courses.filter(c => c.year === yr);
    if (yc.length === 0) return null;
    const totalCredits = yc.reduce((s, c) => s + c.creditUnits, 0);
    const totalPoints  = yc.reduce((s, c) => s + c.creditUnits * gradePoints[c.grade], 0);
    const cgpa = parseFloat((totalPoints / totalCredits).toFixed(2));
    const s1 = calculateSemesterGPA(yr, 1);
    const s2 = calculateSemesterGPA(yr, 2);
    return { yr, cgpa, totalCredits, totalPoints, s1: s1.cgpa, s2: s2.cgpa };
  }).filter(Boolean) as { yr: YearNum; cgpa: number; totalCredits: number; totalPoints: number; s1: number; s2: number }[];

  const gradeCounts = (['A','B','C','D','E','F'] as const)
    .map(g => ({ grade: g, count: courses.filter(c => c.grade === g).length }))
    .filter(g => g.count > 0);

  const { cgpa: overallCGPA, totalCredits, totalPoints } = calculateCGPA();
  const best  = barData.reduce((a, b) => b.gpa > a.gpa ? b : a, barData[0]);
  const worst = barData.reduce((a, b) => b.gpa < a.gpa ? b : a, barData[0]);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall CGPA',   value: overallCGPA,       sub: getCGPAClass(overallCGPA) },
          { label: 'Total Credits',  value: totalCredits,      sub: `(Total pts: ${totalPoints})` },
          { label: 'Best Semester',  value: best?.gpa ?? '—',  sub: best ? `Year ${best.year} Sem ${best.sem}` : '' },
          { label: 'Worst Semester', value: worst?.gpa ?? '—', sub: worst ? `Year ${worst.year} Sem ${worst.sem}` : '' },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">GPA per Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity={1} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [v.toFixed(2), 'GPA']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="gpa" fill="url(#barGrad)" radius={[5, 5, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={gradeCounts}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {gradeCounts.map(({ grade }) => (
                    <Cell key={grade} fill={GRADE_COLORS[grade]} stroke="transparent" />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => [v, 'courses']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Year breakdown table */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Year-by-Year Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left py-2 pr-4">Year</th>
                  <th className="text-center py-2 px-3">Sem 1 GPA</th>
                  <th className="text-center py-2 px-3">Sem 2 GPA</th>
                  <th className="text-center py-2 px-3">Credits</th>
                  <th className="text-center py-2 px-3">Points</th>
                  <th className="text-center py-2 px-3">Year CGPA</th>
                  <th className="text-left py-2 pl-3">Class</th>
                </tr>
              </thead>
              <tbody>
                {yearRows.map(({ yr, cgpa, totalCredits, totalPoints, s1, s2 }) => (
                  <tr key={yr} className="border-b last:border-0 hover:bg-muted/40 transition-colors duration-150">
                    <td className="py-3 pr-4 font-medium">Year {yr}</td>
                    <td className="text-center py-3 px-3">{s1 || '—'}</td>
                    <td className="text-center py-3 px-3">{s2 || '—'}</td>
                    <td className="text-center py-3 px-3">{totalCredits}</td>
                    <td className="text-center py-3 px-3">{totalPoints}</td>
                    <td className="text-center py-3 px-3 font-bold text-primary">{cgpa}</td>
                    <td className="py-3 pl-3 text-xs text-muted-foreground">{getCGPAClass(cgpa)}</td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-semibold">
                  <td className="py-3 pr-4 text-primary">Overall</td>
                  <td className="text-center py-3 px-3 text-xs text-muted-foreground" colSpan={2}>—</td>
                  <td className="text-center py-3 px-3">{totalCredits}</td>
                  <td className="text-center py-3 px-3">{totalPoints}</td>
                  <td className="text-center py-3 px-3 text-primary text-lg">{overallCGPA}</td>
                  <td className="py-3 pl-3 text-xs text-primary">{getCGPAClass(overallCGPA)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
            {(['A','B','C','D','E','F'] as const).map(g => {
              const count = courses.filter(c => c.grade === g).length;
              return (
                <div key={g} className="flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: GRADE_COLORS[g] }} />
                  <span className="text-muted-foreground">{g}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 text-sm ml-auto">
              <span className="text-muted-foreground">Total courses:</span>
              <span className="font-medium">{courses.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CGPAStats;
