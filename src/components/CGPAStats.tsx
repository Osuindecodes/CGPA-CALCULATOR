import React, { useEffect, useRef, useState } from 'react';
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

/* Animated number counter */
const AnimatedNumber = ({ value, decimals = 0 }: { value: number; decimals?: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(parseFloat((eased * value).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, decimals]);

  return <span ref={ref} className="stat-value">{display}</span>;
};

const CGPAStats = () => {
  const { state, calculateSemesterGPA, calculateCGPA } = useCGPA();
  const { courses } = state;

  if (courses.length === 0) {
    return (
      <Card className="w-full card-glow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center">
            <div className="text-5xl mb-4 animate-float">📊</div>
            <p className="text-muted-foreground">Add courses to see your statistics.</p>
          </div>
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

  const statCards = [
    { label: 'Overall CGPA',   value: overallCGPA, decimals: 2, sub: getCGPAClass(overallCGPA), icon: '🎯' },
    { label: 'Total Credits',  value: totalCredits, decimals: 0, sub: `${totalPoints} total points`, icon: '📚' },
    { label: 'Best Semester',  value: best?.gpa ?? 0, decimals: 2, sub: best ? `Year ${best.year} Sem ${best.sem}` : '—', icon: '🏆' },
    { label: 'Worst Semester', value: worst?.gpa ?? 0, decimals: 2, sub: worst ? `Year ${worst.year} Sem ${worst.sem}` : '—', icon: '📉' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, decimals, sub, icon }, i) => (
          <div key={label} className="stat-card">
            <Card className="text-center h-full border-primary/10 overflow-hidden relative">
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <CardContent className="pt-6 pb-5">
                <div className="text-2xl mb-2 animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
                  {icon}
                </div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-extrabold text-primary">
                  <AnimatedNumber value={value} decimals={decimals} />
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glow rounded-xl">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>📊</span> GPA per Semester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={1} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v.toFixed(2), 'GPA']}
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'hsl(var(--primary) / 0.06)' }}
                  />
                  <Bar dataKey="gpa" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="card-glow rounded-xl">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>🍩</span> Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={gradeCounts}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%" cy="50%"
                    innerRadius={58} outerRadius={88}
                    paddingAngle={4}
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {gradeCounts.map(({ grade }) => (
                      <Cell key={grade} fill={GRADE_COLORS[grade]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [v, 'courses']}
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Year breakdown table ── */}
      <div className="card-glow rounded-xl">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span>📋</span> Year-by-Year Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left py-3 pr-4">Year</th>
                    <th className="text-center py-3 px-3">Sem 1 GPA</th>
                    <th className="text-center py-3 px-3">Sem 2 GPA</th>
                    <th className="text-center py-3 px-3">Credits</th>
                    <th className="text-center py-3 px-3">Points</th>
                    <th className="text-center py-3 px-3">Year CGPA</th>
                    <th className="text-left py-3 pl-3">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {yearRows.map(({ yr, cgpa, totalCredits, totalPoints, s1, s2 }, i) => (
                    <tr
                      key={yr}
                      className="border-b last:border-0 transition-all duration-200"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <td className="py-3 pr-4 font-semibold">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {yr}
                          </span>
                          Year {yr}
                        </span>
                      </td>
                      <td className="text-center py-3 px-3">{s1 || '—'}</td>
                      <td className="text-center py-3 px-3">{s2 || '—'}</td>
                      <td className="text-center py-3 px-3">{totalCredits}</td>
                      <td className="text-center py-3 px-3">{totalPoints}</td>
                      <td className="text-center py-3 px-3">
                        <span className="font-bold text-primary text-base">{cgpa}</span>
                      </td>
                      <td className="py-3 pl-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {getCGPAClass(cgpa)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Overall row */}
                  <tr className="bg-primary/5 border-t-2 border-primary/20">
                    <td className="py-3 pr-4 font-bold text-primary">Overall</td>
                    <td className="text-center py-3 px-3 text-muted-foreground text-xs" colSpan={2}>—</td>
                    <td className="text-center py-3 px-3 font-semibold">{totalCredits}</td>
                    <td className="text-center py-3 px-3 font-semibold">{totalPoints}</td>
                    <td className="text-center py-3 px-3">
                      <span className="text-xl font-extrabold text-primary">{overallCGPA}</span>
                    </td>
                    <td className="py-3 pl-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                        {getCGPAClass(overallCGPA)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grade pill summary */}
            <div className="mt-5 pt-4 border-t flex flex-wrap gap-2 items-center">
              {(['A','B','C','D','E','F'] as const).map((g, i) => {
                const count = courses.filter(c => c.grade === g).length;
                return (
                  <div
                    key={g}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: GRADE_COLORS[g] + '40',
                      background: GRADE_COLORS[g] + '15',
                      color: GRADE_COLORS[g],
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[g] }} />
                    {g}: {count}
                  </div>
                );
              })}
              <div className="ml-auto text-xs text-muted-foreground font-medium">
                {courses.length} courses total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CGPAStats;
