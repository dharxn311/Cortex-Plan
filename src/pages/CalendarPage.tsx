import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DayPicker, useNavigation } from 'react-day-picker';
import type { DayContentProps, CaptionProps } from 'react-day-picker';
import { useExams, useSubjects, useStudySessions, useLessons } from '@/hooks/use-api';
import { format, parseISO, startOfDay, isSameMonth } from 'date-fns';
import { PlusCircle, BookMarked, Clock, Trash2, Edit, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StudySessionForm } from '@/components/StudySessionForm';
import { Exam, StudySession, Subject, Lesson, CalendarEvent } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
function CalendarCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between pt-2 px-2 relative">
      <h2 className="text-lg font-semibold">{format(props.displayMonth, 'MMMM yyyy')}</h2>
      <div className="flex items-center gap-1">
        <Button
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          variant="outline"
          size="icon"
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          variant="outline"
          size="icon"
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
function EventDay(props: DayContentProps) {
  const { date, displayMonth } = props;
  const { eventsByDate } = useCalendarContext();
  const dayEvents = eventsByDate[format(startOfDay(date), 'yyyy-MM-dd')];
  const isCurrentMonth = isSameMonth(date, displayMonth);
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      <p className={!isCurrentMonth ? "text-muted-foreground/50" : ""}>
        {date.getDate()}
      </p>
      {dayEvents && isCurrentMonth && (
        <div className="absolute bottom-1 flex space-x-1">
          {dayEvents.slice(0, 3).map((event, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: event.subject?.color || '#ccc' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
const CalendarContext = React.createContext<{ eventsByDate: Record<string, CalendarEvent[]> }>({ eventsByDate: {} });
const useCalendarContext = () => React.useContext(CalendarContext);
export function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { items: exams, loading: examsLoading } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const { items: sessions, createItem, editItem, deleteItem, loading: sessionsLoading } = useStudySessions();
  const { items: lessons, loading: lessonsLoading } = useLessons();
  const subjectsById = useMemo(() => subjects.reduce((acc, sub) => ({ ...acc, [sub.id]: sub }), {} as Record<string, Subject>), [subjects]);
  const examsById = useMemo(() => exams.reduce((acc, exam) => ({ ...acc, [exam.id]: exam }), {} as Record<string, Exam>), [exams]);
  const eventsByDate = useMemo(() => {
    const events: Record<string, CalendarEvent[]> = {};
    exams.forEach(exam => {
      const day = format(startOfDay(parseISO(exam.date)), 'yyyy-MM-dd');
      if (!events[day]) events[day] = [];
      events[day].push({ type: 'exam', data: exam, subject: subjectsById[exam.subjectId] });
    });
    sessions.forEach(session => {
      const day = format(startOfDay(parseISO(session.startTime)), 'yyyy-MM-dd');
      const exam = examsById[session.examId];
      if (!events[day]) events[day] = [];
      events[day].push({ type: 'session', data: session, subject: exam ? subjectsById[exam.subjectId] : null });
    });
    lessons.forEach(lesson => {
        if (lesson.dueDate) {
            const day = format(startOfDay(parseISO(lesson.dueDate)), 'yyyy-MM-dd');
            if (!events[day]) events[day] = [];
            events[day].push({ type: 'lesson', data: lesson, subject: subjectsById[lesson.subjectId] });
        }
    });
    return events;
  }, [exams, sessions, lessons, subjectsById, examsById]);
  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    const day = format(startOfDay(date), 'yyyy-MM-dd');
    return (eventsByDate[day] || []).sort((a, b) => {
      const timeA = a.type === 'exam' ? parseISO((a.data as Exam).date) : a.type === 'session' ? parseISO((a.data as StudySession).startTime) : parseISO((a.data as Lesson).dueDate);
      const timeB = b.type === 'exam' ? parseISO((b.data as Exam).date) : b.type === 'session' ? parseISO((b.data as StudySession).startTime) : parseISO((b.data as Lesson).dueDate);
      return timeA.getTime() - timeB.getTime();
    });
  }, [date, eventsByDate]);
  const handleSessionSubmit = async (data: Omit<StudySession, 'id'> | StudySession) => {
    if ('id' in data) {
      await editItem(data.id, data);
    } else {
      await createItem(data);
    }
  };
  const handleDeleteSession = async () => {
    if (selectedEvent && selectedEvent.type === 'session') {
      await deleteItem(selectedEvent.data.id);
      setAlertOpen(false);
      setSelectedEvent(null);
    }
  };
  const openForm = (event: CalendarEvent | null) => {
    setSelectedEvent(event);
    setFormOpen(true);
  };
  const openAlert = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setAlertOpen(true);
  };
  const isLoading = examsLoading || subjectsLoading || sessionsLoading || lessonsLoading;
  return (
    <CalendarContext.Provider value={{ eventsByDate }}>
      <PageHeader title="Calendar" subtitle="Visualize your exams, lessons, and study schedule.">
        <Button onClick={() => openForm(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </PageHeader>
      <div className="grid gap-8 md:grid-cols-[1fr_400px]">
        <Card>
          <CardContent className="p-0 flex justify-center">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-12 w-12 p-0 font-normal aria-selected:opacity-100',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
                day_today: 'bg-accent text-accent-foreground rounded-md',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
              }}
              components={{
                caption: CalendarCaption,
                DayContent: EventDay,
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Agenda for {date ? format(date, 'MMMM d, yyyy') : '...'}
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : selectedDayEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDayEvents.map((event, i) => {
                const subject = event.subject;
                const getIcon = () => {
                    switch(event.type) {
                        case 'exam': return <BookMarked className="h-4 w-4 text-destructive" />;
                        case 'session': return <Clock className="h-4 w-4 text-primary" />;
                        case 'lesson': return <ClipboardCheck className="h-4 w-4 text-green-600" />;
                        default: return null;
                    }
                }
                return (
                  <div key={i} className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50" style={{ borderLeftColor: subject?.color, borderLeftWidth: '4px' }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      {getIcon()}
                    </div>
                    <div className="flex-grow">
                      <p className={`font-semibold ${event.type === 'exam' ? 'text-destructive' : ''}`}>{event.data.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.type === 'exam'
                          ? `Exam for ${subject?.name || '...'}`
                          : event.type === 'session'
                          ? `${format(parseISO((event.data as StudySession).startTime), 'p')} - ${format(parseISO((event.data as StudySession).endTime), 'p')}`
                          : `Due for ${subject?.name || '...'}`}
                      </p>
                    </div>
                    {event.type === 'session' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="flex flex-col">
                            <Button variant="ghost" className="justify-start p-2" onClick={() => openForm(event)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button variant="ghost" className="justify-start p-2 text-red-500 hover:text-red-600" onClick={() => openAlert(event)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
              <p className="text-sm font-medium">No events scheduled.</p>
              <p className="text-xs text-muted-foreground">Select another day or add a new session.</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.type === 'session' ? 'Edit Study Session' : 'Schedule New Study Session'}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.type === 'session' ? 'Update the details for your study session.' : 'Fill in the details to add a new study session.'}
            </DialogDescription>
          </DialogHeader>
          <StudySessionForm
            exams={exams}
            onSubmit={handleSessionSubmit}
            initialData={selectedEvent?.type === 'session' ? selectedEvent.data as StudySession : { date: date || new Date() }}
            onClose={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the study session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CalendarContext.Provider>
  );
}