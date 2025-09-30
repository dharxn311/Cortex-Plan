import React, { useMemo } from 'react';
import { useExams, useSubjects, useStudySessions } from '@/hooks/use-api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Book, BookCopy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns';
import { Exam, StudySession } from '@shared/types';
import { ProgressSummary } from '@/components/ProgressSummary';
function UpcomingExams() {
  const { items: exams, loading: examsLoading } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const subjectsById = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.id] = subject;
      return acc;
    }, {} as Record<string, any>);
  }, [subjects]);
  const upcomingExams = useMemo(() => {
    return exams
      .filter((exam: Exam) => new Date(exam.date) >= new Date())
      .sort((a: Exam, b: Exam) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [exams]);
  const isLoading = examsLoading || subjectsLoading;
  if (isLoading || upcomingExams.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingExams.map((exam: Exam) => {
            const subject = subjectsById[exam.subjectId];
            return (
              <div key={exam.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-sm" style={{ color: subject?.color || 'inherit' }}>
                    {subject?.name || 'Uncategorized'}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground mt-2 sm:mt-0 text-left sm:text-right">
                  <p>{format(new Date(exam.date), 'EEEE, MMM d')}</p>
                  <p>{formatDistanceToNow(new Date(exam.date), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
function TodaysAgenda() {
  const { items: sessions, loading: sessionsLoading } = useStudySessions();
  const { items: exams, loading: examsLoading } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const examsById = useMemo(() => exams.reduce((acc, exam) => ({ ...acc, [exam.id]: exam }), {} as Record<string, Exam>), [exams]);
  const subjectsById = useMemo(() => subjects.reduce((acc, subject) => ({ ...acc, [subject.id]: subject }), {} as Record<string, any>), [subjects]);
  const todaysSessions = useMemo(() => {
    return sessions
      .filter((session: StudySession) => isToday(parseISO(session.startTime)))
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  }, [sessions]);
  const isLoading = sessionsLoading || examsLoading || subjectsLoading;
  if (isLoading || todaysSessions.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Agenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysSessions.map((session: StudySession) => {
            const exam = examsById[session.examId];
            const subject = exam ? subjectsById[exam.subjectId] : null;
            return (
              <div key={session.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: subject?.color || '#ccc' }}>
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(session.startTime), 'p')} - {format(parseISO(session.endTime), 'p')}
                  </p>
                  <p className="text-sm" style={{ color: subject?.color || 'inherit' }}>
                    For: {exam?.title || 'Unknown Exam'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export function HomePage() {
  const { items: exams, loading: examsLoading } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const { items: sessions, loading: sessionsLoading } = useStudySessions();
  const isLoading = examsLoading || subjectsLoading || sessionsLoading;
  const hasSubjects = subjects.length > 0;
  const hasData = exams.length > 0 || sessions.length > 0;
  const showEmptyState = !isLoading && !hasData;
  return (
    <div className="animate-fade-in">
      <div className="relative rounded-xl overflow-auto p-8 mb-8 bg-gradient-to-tr from-sky-100 via-slate-50 to-blue-100 dark:from-slate-800/80 dark:via-slate-900/50 dark:to-blue-900/30">
        <div
            className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-10 dark:opacity-20 animate-gradient-move bg-[length:200%_200%]"
            style={{ willChange: 'background-position' }}
        />
        <div className="relative">
            <PageHeader
                title="Welcome to Cortex Plan"
                subtitle="Your minimalist exam planner for focused preparation."
            />
        </div>
      </div>
      <div className="space-y-8">
        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : showEmptyState ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Book className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Your planner is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasSubjects ? "Add an exam to get started." : "Add your subjects first, then schedule your exams."}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild>
                <Link to={hasSubjects ? "/exams" : "/subjects"}>
                  {hasSubjects ? <PlusCircle className="mr-2 h-4 w-4" /> : <BookCopy className="mr-2 h-4 w-4" />}
                  {hasSubjects ? "Add Exam" : "Add Subjects"}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8">
              <ProgressSummary />
              <TodaysAgenda />
            </div>
            <div className="space-y-8">
              <UpcomingExams />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}