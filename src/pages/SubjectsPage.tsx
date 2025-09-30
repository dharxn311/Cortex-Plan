import React, { useState } from 'react';
import { useSubjects } from '@/hooks/use-api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit, BookCopy } from 'lucide-react';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Subject } from '@shared/types';
import { LessonManager } from '@/components/LessonManager';
const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
});
type SubjectFormData = z.infer<typeof subjectSchema>;
const colorPalette = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'
];
function SubjectForm({
  onSubmit,
  initialData,
  onClose,
}: {
  onSubmit: (data: SubjectFormData) => Promise<void>;
  initialData?: Subject | null;
  onClose: () => void;
}) {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || colorPalette[0],
    },
  });
  const { isSubmitting } = form.formState;
  const handleSubmit = async (data: SubjectFormData) => {
    await onSubmit(data);
    form.reset();
    onClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Calculus II" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        field.value === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Subject'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export function SubjectsPage() {
  const { items: subjects, loading, createItem, editItem, deleteItem } = useSubjects();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const handleCreate = async (data: SubjectFormData) => {
    await createItem(data);
  };
  const handleEdit = async (data: SubjectFormData) => {
    if (selectedSubject) {
      await editItem(selectedSubject.id, data);
    }
  };
  const handleDelete = async () => {
    if (selectedSubject) {
      await deleteItem(selectedSubject.id);
      setAlertOpen(false);
      setSelectedSubject(null);
    }
  };
  const openEditDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormOpen(true);
  };
  const openDeleteAlert = (subject: Subject) => {
    setSelectedSubject(subject);
    setAlertOpen(true);
  };
  return (
    <>
      <PageHeader title="Subjects" subtitle="Organize your courses and manage their lessons.">
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSubject(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              <DialogDescription>
                Give your subject a name and pick a color for easy identification.
              </DialogDescription>
            </DialogHeader>
            <SubjectForm
              onSubmit={selectedSubject ? handleEdit : handleCreate}
              initialData={selectedSubject}
              onClose={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BookCopy className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No subjects found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
          <div className="mt-6">
            <Button onClick={() => { setSelectedSubject(null); setFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {subjects.map((subject) => (
            <AccordionItem value={subject.id} key={subject.id} className="border rounded-lg bg-card">
              <div className="flex items-center justify-between w-full px-4 py-1">
                <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                    <span className="font-medium text-lg">{subject.name}</span>
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(subject)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => openDeleteAlert(subject)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <AccordionContent>
                <LessonManager subjectId={subject.id} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject and all associated lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSubject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}