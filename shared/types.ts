export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// Cortex Plan types
export interface Subject {
  id: string;
  name:string;
  color: string;
}
export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO 8601 string
}
export interface StudySession {
  id: string;
  examId: string;
  title: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
}
export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 string
  isComplete: boolean;
}
export type CalendarEvent = 
  | { type: 'exam'; data: Exam; subject: Subject | null }
  | { type: 'session'; data: StudySession; subject: Subject | null }
  | { type: 'lesson'; data: Lesson; subject: Subject | null };