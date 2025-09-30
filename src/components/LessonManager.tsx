import React, { useState, useMemo } from 'react';
import { useLessons } from '@/hooks/use-api';
import { Lesson } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { LessonForm } from './LessonForm';
interface LessonManagerProps {
  subjectId: string;
}
export function LessonManager({ subjectId }: LessonManagerProps) {
  const { items: lessons, loading, createItem, editItem, deleteItem } = useLessons(subjectId);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      // Sort by completion status first (incomplete lessons first)
      if (a.isComplete !== b.isComplete) {
        return a.isComplete ? 1 : -1;
      }
      // Then, sort by due date
      if (a.dueDate && b.dueDate) {
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      }
      // Keep lessons without a due date at the end
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [lessons]);
  const handleCreate = async (data: Omit<Lesson, 'id' | 'subjectId' | 'isComplete'>) => {
    await createItem({ ...data, subjectId, isComplete: false });
  };
  const handleEdit = async (data: Omit<Lesson, 'id' | 'subjectId' | 'isComplete'>) => {
    if (selectedLesson) {
      await editItem(selectedLesson.id, { ...data });
    }
  };
  const handleDelete = async () => {
    if (selectedLesson) {
      await deleteItem(selectedLesson.id);
      setAlertOpen(false);
      setSelectedLesson(null);
    }
  };
  const handleToggleComplete = (lesson: Lesson) => {
    editItem(lesson.id, { isComplete: !lesson.isComplete });
  };
  const openEditDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setFormOpen(true);
  };
  const openDeleteAlert = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setAlertOpen(true);
  };
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Lessons & Topics</h4>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setSelectedLesson(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
              <DialogDescription>
                Fill in the details for your lesson. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <LessonForm
              onSubmit={selectedLesson ? handleEdit : handleCreate}
              initialData={selectedLesson}
              onClose={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No lessons added for this subject yet.</p>
      ) : (
        <div className="space-y-2">
          {sortedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`lesson-${lesson.id}`}
                  checked={lesson.isComplete}
                  onCheckedChange={() => handleToggleComplete(lesson)}
                />
                <label
                  htmlFor={`lesson-${lesson.id}`}
                  className={`flex-grow cursor-pointer ${lesson.isComplete ? 'text-muted-foreground line-through' : ''}`}
                >
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.dueDate ? `Due: ${format(parseISO(lesson.dueDate), 'MMM d, yyyy')}` : 'No due date'}
                  </p>
                </label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(lesson)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDeleteAlert(lesson)} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lesson.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLesson(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}