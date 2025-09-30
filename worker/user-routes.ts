import { Hono } from "hono";
import type { Env } from './core-utils';
import { SubjectEntity, ExamEntity, StudySessionEntity, LessonEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Subject, Exam, StudySession, Lesson } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- CORTEX PLAN ROUTES ---
  // SUBJECTS
  app.get('/api/subjects', async (c) => {
    const page = await SubjectEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/subjects', async (c) => {
    const { name, color } = await c.req.json<Partial<Subject>>();
    if (!isStr(name) || !isStr(color)) return bad(c, 'name and color are required');
    const subject = await SubjectEntity.create(c.env, { id: crypto.randomUUID(), name, color });
    return ok(c, subject);
  });
  app.put('/api/subjects/:id', async (c) => {
    const { id } = c.req.param();
    const { name, color } = await c.req.json<Partial<Subject>>();
    if (!name && !color) return bad(c, 'name or color must be provided');
    const entity = new SubjectEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Subject not found');
    await entity.patch({ name, color });
    return ok(c, await entity.getState());
  });
  app.delete('/api/subjects/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await SubjectEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Subject not found');
    return ok(c, { id, deleted });
  });
  // EXAMS
  app.get('/api/exams', async (c) => {
    const page = await ExamEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/exams', async (c) => {
    const { title, subjectId, date } = await c.req.json<Partial<Exam>>();
    if (!isStr(title) || !isStr(subjectId) || !isStr(date)) return bad(c, 'title, subjectId, and date are required');
    const exam = await ExamEntity.create(c.env, { id: crypto.randomUUID(), title, subjectId, date });
    return ok(c, exam);
  });
  app.put('/api/exams/:id', async (c) => {
    const { id } = c.req.param();
    const { title, subjectId, date } = await c.req.json<Partial<Exam>>();
    const entity = new ExamEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Exam not found');
    await entity.patch({ title, subjectId, date });
    return ok(c, await entity.getState());
  });
  app.delete('/api/exams/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ExamEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Exam not found');
    return ok(c, { id, deleted });
  });
  // STUDY SESSIONS
  app.get('/api/studysessions', async (c) => {
    const page = await StudySessionEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/studysessions', async (c) => {
    const { title, examId, startTime, endTime } = await c.req.json<Partial<StudySession>>();
    if (!isStr(title) || !isStr(examId) || !isStr(startTime) || !isStr(endTime)) {
      return bad(c, 'title, examId, startTime, and endTime are required');
    }
    const session = await StudySessionEntity.create(c.env, { id: crypto.randomUUID(), title, examId, startTime, endTime });
    return ok(c, session);
  });
  app.put('/api/studysessions/:id', async (c) => {
    const { id } = c.req.param();
    const { title, examId, startTime, endTime } = await c.req.json<Partial<StudySession>>();
    const entity = new StudySessionEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Study session not found');
    await entity.patch({ title, examId, startTime, endTime });
    return ok(c, await entity.getState());
  });
  app.delete('/api/studysessions/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await StudySessionEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Study session not found');
    return ok(c, { id, deleted });
  });
  // LESSONS
  app.get('/api/lessons', async (c) => {
    const { subjectId } = c.req.query();
    const page = await LessonEntity.list(c.env);
    if (subjectId) {
      page.items = page.items.filter(lesson => lesson.subjectId === subjectId);
    }
    return ok(c, page);
  });
  app.post('/api/lessons', async (c) => {
    const { title, description, subjectId, dueDate } = await c.req.json<Partial<Lesson>>();
    if (!isStr(title) || !isStr(subjectId) || !isStr(dueDate)) {
      return bad(c, 'title, subjectId, and dueDate are required');
    }
    const lesson = await LessonEntity.create(c.env, { id: crypto.randomUUID(), title, description: description || '', subjectId, dueDate, isComplete: false });
    return ok(c, lesson);
  });
  app.put('/api/lessons/:id', async (c) => {
    const { id } = c.req.param();
    const { title, description, dueDate, isComplete } = await c.req.json<Partial<Lesson>>();
    const entity = new LessonEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Lesson not found');
    await entity.patch({ title, description, dueDate, isComplete });
    return ok(c, await entity.getState());
  });
  app.delete('/api/lessons/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await LessonEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Lesson not found');
    return ok(c, { id, deleted });
  });
}