import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Exam, StudySession } from '@shared/types';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
const studySessionSchema = z.object({
  title: z.string().min(1, 'Session title is required'),
  examId: z.string().min(1, 'Associated exam is required'),
  date: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
export type StudySessionFormData = z.infer<typeof studySessionSchema>;
interface StudySessionFormProps {
  exams: Exam[];
  onSubmit: (data: Omit<StudySession, 'id'> | StudySession) => Promise<void>;
  initialData?: Partial<StudySession> & { date?: Date };
  onClose: () => void;
}
export function StudySessionForm({ exams, onSubmit, initialData, onClose }: StudySessionFormProps) {
  const isEditing = !!initialData?.id;
  const getDefaultValues = () => {
    if (isEditing && initialData) {
      const startTime = parseISO(initialData.startTime!);
      return {
        title: initialData.title || '',
        examId: initialData.examId || '',
        date: startTime,
        startTime: format(startTime, 'HH:mm'),
        endTime: format(parseISO(initialData.endTime!), 'HH:mm'),
      };
    }
    return {
      title: '',
      examId: initialData?.examId || '',
      date: initialData?.date || new Date(),
      startTime: '09:00',
      endTime: '11:00',
    };
  };
  const form = useForm<StudySessionFormData>({
    resolver: zodResolver(studySessionSchema),
    defaultValues: getDefaultValues(),
  });
  const { isSubmitting } = form.formState;
  const handleSubmit = async (data: StudySessionFormData) => {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startTime = setMinutes(setHours(data.date, startHour), startMinute);
    const endTime = setMinutes(setHours(data.date, endHour), endMinute);
    const payload = {
      title: data.title,
      examId: data.examId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    if (isEditing) {
      await onSubmit({ ...payload, id: initialData!.id! });
    } else {
      await onSubmit(payload);
    }
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
              <FormLabel>Session Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chapter 5 Review" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="examId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Exam</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Session'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}