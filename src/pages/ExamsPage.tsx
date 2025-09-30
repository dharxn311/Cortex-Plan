import React, { useState, useMemo } from 'react';
import { useExams, useSubjects, useStudySessions } from '@/hooks/use-api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Trash2, Edit, Book, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Exam, StudySession } from '@shared/types';
import { StudySessionForm } from '@/components/StudySessionForm';
const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.date(),
});
type ExamFormData = z.infer<typeof examSchema>;
function ExamForm({
  subjects,
  onSubmit,
  initialData,
  onClose,
}: {
  subjects: any[];
  onSubmit: (data: ExamFormData) => Promise<void>;
  initialData?: Exam | null;
  onClose: () => void;
}) {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: initialData?.title || '',
      subjectId: initialData?.subjectId || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });
  const { isSubmitting } = form.formState;
  const handleSubmit = async (data: ExamFormData) => {
    await onSubmit(data);
    form.reset();
    onClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Midterm 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Exam Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Exam'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export function ExamsPage() {
  const { items: exams, loading: examsLoading, createItem: createExam, editItem: editExam, deleteItem: deleteExam } = useExams();
  const { items: subjects, loading: subjectsLoading } = useSubjects();
  const { createItem: createStudySession } = useStudySessions();
  const [isExamFormOpen, setExamFormOpen] = useState(false);
  const [isSessionFormOpen, setSessionFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const subjectsById = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.id] = subject;
      return acc;
    }, {} as Record<string, any>);
  }, [subjects]);
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);
  const handleCreateExam = async (data: ExamFormData) => {
    await createExam({ ...data, date: data.date.toISOString() });
  };
  const handleEditExam = async (data: ExamFormData) => {
    if (selectedExam) {
      await editExam(selectedExam.id, { ...data, date: data.date.toISOString() });
    }
  };
  const handleDeleteExam = async () => {
    if (selectedExam) {
      await deleteExam(selectedExam.id);
      setAlertOpen(false);
      setSelectedExam(null);
    }
  };
  const handleCreateSession = async (data: Omit<StudySession, 'id'>) => {
    await createStudySession(data);
  };
  const openEditDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setExamFormOpen(true);
  };
  const openDeleteAlert = (exam: Exam) => {
    setSelectedExam(exam);
    setAlertOpen(true);
  };
  const openScheduleDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setSessionFormOpen(true);
  };
  const isLoading = examsLoading || subjectsLoading;
  return (
    <>
      <PageHeader title="Exams" subtitle="Manage your upcoming exams and tests.">
        <Dialog open={isExamFormOpen} onOpenChange={setExamFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedExam(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
              <DialogDescription>
                Fill in the details for your exam. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <ExamForm
              subjects={subjects}
              onSubmit={selectedExam ? handleEditExam : handleCreateExam}
              initialData={selectedExam}
              onClose={() => setExamFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Book className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No exams found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first exam.</p>
          <div className="mt-6">
            <Button onClick={() => { setSelectedExam(null); setExamFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exam
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedExams.map((exam) => {
            const subject = subjectsById[exam.subjectId];
            return (
              <Card key={exam.id} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{exam.title}</CardTitle>
                    <CardDescription>
                      {subject ? (
                        <span style={{ color: subject.color }}>{subject.name}</span>
                      ) : (
                        'Uncategorized'
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(exam)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteAlert(exam)} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{format(new Date(exam.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openScheduleDialog(exam)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Study
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedExam(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isSessionFormOpen} onOpenChange={setSessionFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Study Session</DialogTitle>
            <DialogDescription>
              Plan a study session for "{selectedExam?.title}".
            </DialogDescription>
          </DialogHeader>
          <StudySessionForm
            exams={exams}
            onSubmit={handleCreateSession}
            initialData={{ examId: selectedExam?.id, date: selectedExam ? new Date(selectedExam.date) : new Date() }}
            onClose={() => setSessionFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}