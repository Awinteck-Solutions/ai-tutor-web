import api from '../../../shared/api/axios.instance';
import { teacherEndpoints as ep } from '../teacher.endpoints';
import {
  normalizeTeacherDashboard,
  unwrapData,
  unwrapList,
  unwrapPaginated,
} from '../../../shared/utils/formatters';

const orgParam = (organizationId, extra = {}) => ({
  params: { organizationId, ...extra },
});

export const getDashboard = async (organizationId) => {
  const res = await api.get(ep.dashboard, orgParam(organizationId));
  return normalizeTeacherDashboard(unwrapData(res));
};

export const getTeacherAnalytics = async (organizationId) =>
  unwrapData(await api.get(ep.analytics, orgParam(organizationId)));

export const searchContent = async (organizationId, q, types) =>
  unwrapData(await api.get(ep.search, { params: { organizationId, q, types } }));

export const getNotifications = async (params = {}) =>
  unwrapPaginated(await api.get(ep.notifications, { params }));

export const markNotificationRead = async (id) =>
  unwrapData(await api.patch(ep.notificationRead(id)));

export const markAllNotificationsRead = async () =>
  unwrapData(await api.patch(ep.notificationsReadAll));

export const getSubjects = async (organizationId) =>
  unwrapData(await api.get(ep.subjects, orgParam(organizationId)));

export const getTopics = async (organizationId, subjectId) =>
  unwrapData(await api.get(ep.topics, orgParam(organizationId, { subjectId })));

export const getMaterials = async (organizationId, params = {}) =>
  unwrapList(unwrapData(await api.get(ep.materials, orgParam(organizationId, params))));

export const getMaterialsPaginated = async (organizationId, params = {}) =>
  unwrapPaginated(await api.get(ep.materials, orgParam(organizationId, params)));

export const getMaterial = async (id, organizationId) =>
  unwrapData(await api.get(ep.material(id), { params: { organizationId } }));

export const getMaterialChunks = async (id, organizationId) =>
  unwrapData(await api.get(ep.materialChunks(id), { params: { organizationId } }));

export const getLessons = async (organizationId, params = {}) =>
  unwrapList(unwrapData(await api.get(ep.lessons, orgParam(organizationId, params))));

export const getLessonsPaginated = async (organizationId, params = {}) =>
  unwrapPaginated(await api.get(ep.lessons, orgParam(organizationId, params)));

export const getStudents = async (organizationId) =>
  unwrapList(unwrapData(await api.get(ep.students, orgParam(organizationId))));

export const getStudent = async (id, organizationId) =>
  unwrapData(await api.get(ep.student(id), orgParam(organizationId)));

export const uploadPdf = async (formData) =>
  unwrapData(await api.post(ep.uploadPdf, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));

export const uploadText = async (payload) =>
  unwrapData(await api.post(ep.uploadText, payload));

export const uploadYoutube = async (payload) =>
  unwrapData(await api.post(ep.uploadYoutube, payload));

export const deleteMaterial = async (id, organizationId) =>
  unwrapData(await api.delete(ep.material(id), { params: { organizationId } }));

export const reprocessMaterial = async (id, organizationId) =>
  unwrapData(await api.post(ep.materialReprocess(id), {}, { params: { organizationId } }));

export const getMaterialLogs = async (id, organizationId) =>
  unwrapData(await api.get(ep.materialLogs(id), { params: { organizationId } }));

export const getLesson = async (id, organizationId) =>
  unwrapData(await api.get(ep.lesson(id), { params: { organizationId } }));

export const generateLesson = async (payload) =>
  unwrapData(await api.post(ep.lessonGenerate, payload));

export const regenerateLesson = async (id, organizationId) =>
  unwrapData(await api.post(ep.lessonRegenerate(id), {}, { params: { organizationId } }));

export const deleteLesson = async (id, organizationId) =>
  unwrapData(await api.delete(ep.lesson(id), { params: { organizationId } }));

export const getLessonSources = async (id, organizationId) =>
  unwrapData(await api.get(ep.lessonSources(id), { params: { organizationId } }));

export const generateLessonFlashcards = async (lessonId, organizationId) =>
  unwrapData(await api.post(ep.lessonFlashcardsGenerate(lessonId), {}, { params: { organizationId } }));

export const getLessonFlashcards = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonFlashcards(lessonId), { params: { organizationId } }));

export const generateLessonQuiz = async (lessonId, organizationId) =>
  unwrapData(await api.post(ep.lessonQuizGenerate(lessonId), {}, { params: { organizationId } }));

export const getLessonQuiz = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonQuiz(lessonId), { params: { organizationId } }));

export const getJob = async (jobId, queue) =>
  unwrapData(await api.get(ep.job(jobId), { params: { queue } }));

export const pollJobUntilComplete = async (jobId, queue, { intervalMs = 2000, maxAttempts = 60 } = {}) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    const job = await getJob(jobId, queue);
    const state = job?.state || job?.status;
    if (state === 'completed' || state === 'COMPLETED') return job;
    if (state === 'failed' || state === 'FAILED') throw new Error(job?.failedReason || 'Job failed');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Job polling timed out');
};
