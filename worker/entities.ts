/**
 * One Durable Object instance per entity (Subject, Exam, StudySession, Lesson), with Indexes for listing.
 */
import { IndexedEntity } from "./core-utils";
import type { Subject, Exam, StudySession, Lesson } from "@shared/types";
// SUBJECT ENTITY
export class SubjectEntity extends IndexedEntity<Subject> {
  static readonly entityName = "subject";
  static readonly indexName = "subjects";
  static readonly initialState: Subject = { id: "", name: "", color: "#000000" };
}
// EXAM ENTITY
export class ExamEntity extends IndexedEntity<Exam> {
  static readonly entityName = "exam";
  static readonly indexName = "exams";
  static readonly initialState: Exam = { id: "", subjectId: "", title: "", date: "" };
}
// STUDY SESSION ENTITY
export class StudySessionEntity extends IndexedEntity<StudySession> {
  static readonly entityName = "studysession";
  static readonly indexName = "studysessions";
  static readonly initialState: StudySession = { id: "", examId: "", title: "", startTime: "", endTime: "" };
}
// LESSON ENTITY
export class LessonEntity extends IndexedEntity<Lesson> {
  static readonly entityName = "lesson";
  static readonly indexName = "lessons";
  static readonly initialState: Lesson = { id: "", subjectId: "", title: "", description: "", dueDate: "", isComplete: false };
}