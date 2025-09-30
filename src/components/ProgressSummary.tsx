import React, { useMemo } from 'react';
import { useStudySessions, useExams, useSubjects } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { differenceInHours, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { BookOpen } from 'lucide-react';
export function ProgressSummary() {
  const { items: sessions, loading: sessionsLoading } = useStudySessions();
  const { items: exams, loading: examsLoading } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const isLoading = sessionsLoading || examsLoading || subjectsLoading;
  const progressData = useMemo(() => {
    if (isLoading || subjects.length === 0) return [];
    const hoursBySubject: Record<string, { name: string; hours: number; color: string }> = subjects.reduce((acc, subject) => {
      acc[subject.id] = { name: subject.name, hours: 0, color: subject.color };
      return acc;
    }, {} as Record<string, { name: string; hours: number; color: string }>);
    const examsById = exams.reduce((acc, exam) => ({ ...acc, [exam.id]: exam }), {} as Record<string, any>);
    sessions.forEach(session => {
      const exam = examsById[session.examId];
      if (exam && hoursBySubject[exam.subjectId]) {
        const hours = differenceInHours(parseISO(session.endTime), parseISO(session.startTime));
        hoursBySubject[exam.subjectId].hours += hours;
      }
    });
    return Object.values(hoursBySubject).filter(data => data.hours > 0);
  }, [sessions, exams, subjects, isLoading]);
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  if (progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Progress</CardTitle>
          <CardDescription>Hours studied per subject.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No study data yet</p>
            <p className="text-sm text-muted-foreground">Schedule and complete study sessions to see your progress.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Progress</CardTitle>
        <CardDescription>Total hours studied per subject.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis unit="h" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              {progressData.map((entry) => (
                <Bar key={entry.name} dataKey="hours" fill={entry.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}