import api from '../../../shared/api/axios.instance';
import { organizationEndpoints as ep } from '../organization.endpoints';
import { unwrapData, unwrapList, unwrapPaginated } from '../../../shared/utils/formatters';

const orgParam = (organizationId, extra = {}) => ({
  params: { organizationId, ...extra },
});

const fetchPaginated = async (request) => unwrapPaginated(await request);

// --- Org portal ---
export const getDashboard = async (organizationId) =>
  unwrapData(await api.get(ep.dashboard, orgParam(organizationId)));

export const getUsage = async (organizationId) =>
  unwrapData(await api.get(ep.usage, orgParam(organizationId)));

export const getSubscription = async (organizationId) =>
  unwrapData(await api.get(ep.subscription, orgParam(organizationId)));

// --- Organizations ---
export const listOrganizations = async (params = {}) =>
  unwrapData(await api.get(ep.organizations, { params }));

export const createOrganization = async (payload) =>
  unwrapData(await api.post(ep.organizations, payload));

export const getOrganization = async (id) =>
  unwrapData(await api.get(ep.org(id)));

export const updateOrganization = async (id, payload) =>
  unwrapData(await api.patch(ep.org(id), payload));

export const deleteOrganization = async (id) =>
  unwrapData(await api.delete(ep.org(id)));

// --- Members & invites ---
export const getMembers = async (id, params = {}) =>
  fetchPaginated(api.get(ep.members(id), { params }));

export const createMember = async (id, payload) =>
  unwrapData(await api.post(ep.memberCreate(id), payload));

export const removeMember = async (id, userId) =>
  unwrapData(await api.delete(ep.member(id, userId)));

export const suspendMember = async (id, userId, suspend = true) =>
  unwrapData(await api.patch(ep.suspend(id, userId), { suspend }));

export const getInvites = async (id, params = {}) =>
  fetchPaginated(api.get(ep.invites(id), { params }));

export const sendInvite = async (id, payload) =>
  unwrapData(await api.post(ep.invites(id), payload));

export const previewInvite = async (token) =>
  unwrapData(await api.get(ep.invitePreview, { params: { token } }));

export const acceptInvite = async (payload) =>
  unwrapData(await api.post(ep.inviteAccept, payload));

// --- Assignments ---
export const getAssignments = async (id) =>
  unwrapData(await api.get(ep.assignments(id)));

export const assignTeacher = async (id, payload) =>
  unwrapData(await api.post(ep.teacherAssignment(id), payload));

export const enrollStudent = async (id, payload) =>
  unwrapData(await api.post(ep.studentAssignment(id), payload));

export const linkParent = async (id, payload) =>
  unwrapData(await api.post(ep.parentLink(id), payload));

// --- Academic ---
export const getYears = async (orgId, params = {}) =>
  fetchPaginated(api.get(ep.years(orgId), { params }));

export const getYearsList = async (orgId) => {
  const { items } = await getYears(orgId, { limit: 100 });
  return items;
};

export const createYear = async (orgId, payload) =>
  unwrapData(await api.post(ep.years(orgId), payload));

export const getYearTerms = async (orgId, yearId, params = {}) =>
  fetchPaginated(api.get(ep.yearTerms(orgId, yearId), { params }));

export const createTerm = async (orgId, payload) =>
  unwrapData(await api.post(ep.terms(orgId), payload));

export const getSubjects = async (orgId, params = {}) =>
  fetchPaginated(api.get(ep.subjects(orgId), { params }));

export const getSubjectsList = async (orgId, params = {}) => {
  const { items } = await getSubjects(orgId, { limit: 100, ...params });
  return items;
};

export const createSubject = async (orgId, payload) =>
  unwrapData(await api.post(ep.subjects(orgId), payload));

export const getSubjectEnrollments = async (orgId, subjectId) =>
  unwrapData(await api.get(ep.subjectEnrollments(orgId, subjectId)));

export const getTopics = async (orgId, subjectId, params = {}) => {
  if (!subjectId) throw new Error('subjectId is required to list topics');
  return fetchPaginated(api.get(ep.subjectTopics(orgId, subjectId), { params }));
};

export const getTopicsList = async (orgId, subjectId) => {
  const { items } = await getTopics(orgId, subjectId, { limit: 200 });
  return items;
};

export const createTopic = async (orgId, payload) =>
  unwrapData(await api.post(ep.topics(orgId), payload));

export const reorderTopics = async (orgId, subjectId, orderedIds) =>
  unwrapData(await api.patch(ep.reorderTopics(orgId, subjectId), { orderedIds }));

// --- Materials ---
export const getMaterials = async (organizationId, params = {}) =>
  unwrapList(unwrapData(await api.get(ep.materials, { params: { organizationId, ...params } })));

export const getMaterialsPaginated = async (organizationId, params = {}) =>
  unwrapPaginated(await api.get(ep.materials, { params: { organizationId, ...params } }));

export const getMaterial = async (id, organizationId) =>
  unwrapData(await api.get(ep.material(id), { params: { organizationId } }));

export const getMaterialChunks = async (id, organizationId) =>
  unwrapData(await api.get(ep.materialChunks(id), { params: { organizationId } }));

export const archiveMaterial = async (id, organizationId) =>
  unwrapData(await api.patch(ep.materialArchive(id), null, { params: { organizationId } }));

export const deleteMaterial = async (id, organizationId) =>
  unwrapData(await api.delete(ep.material(id), { params: { organizationId } }));

export const reprocessMaterial = async (id, organizationId) =>
  unwrapData(await api.post(ep.materialReprocess(id), {}, { params: { organizationId } }));

export const getMaterialLogs = async (id, organizationId) =>
  unwrapData(await api.get(ep.materialLogs(id), { params: { organizationId } }));

export const uploadPdf = async (formData) =>
  unwrapData(await api.post(ep.uploadPdf, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));

export const uploadText = async (payload) =>
  unwrapData(await api.post(ep.uploadText, payload));

export const uploadYoutube = async (payload) =>
  unwrapData(await api.post(ep.uploadYoutube, payload));

// --- Lessons ---
export const getLessons = async (organizationId, params = {}) =>
  unwrapList(unwrapData(await api.get(ep.lessons, { params: { organizationId, ...params } })));

export const getLessonsPaginated = async (organizationId, params = {}) =>
  unwrapPaginated(await api.get(ep.lessons, { params: { organizationId, ...params } }));

export const getLesson = async (id, organizationId) =>
  unwrapData(await api.get(ep.lesson(id), { params: { organizationId } }));

export const getLessonSources = async (id, organizationId) =>
  unwrapData(await api.get(ep.lessonSources(id), { params: { organizationId } }));

export const generateLesson = async (payload) =>
  unwrapData(await api.post(ep.lessonGenerate, payload));

export const regenerateLesson = async (id, organizationId) =>
  unwrapData(await api.post(ep.lessonRegenerate(id), {}, { params: { organizationId } }));

export const deleteLesson = async (id, organizationId) =>
  unwrapData(await api.delete(ep.lesson(id), { params: { organizationId } }));

export const generateLessonFlashcards = async (lessonId, organizationId) =>
  unwrapData(await api.post(ep.lessonFlashcardsGenerate(lessonId), {}, { params: { organizationId } }));

export const getLessonFlashcards = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonFlashcards(lessonId), { params: { organizationId } }));

export const generateLessonQuiz = async (lessonId, organizationId) =>
  unwrapData(await api.post(ep.lessonQuizGenerate(lessonId), {}, { params: { organizationId } }));

export const getLessonQuiz = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonQuiz(lessonId), { params: { organizationId } }));

export const getLessonQuizQuestions = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonQuizQuestions(lessonId), { params: { organizationId } }));

// --- Analytics & search ---
export const getAnalytics = async (organizationId) =>
  unwrapData(await api.get(ep.analytics(organizationId)));

export const getTeacherAnalytics = async (organizationId) =>
  unwrapData(await api.get(ep.teacherAnalytics, orgParam(organizationId)));

export const getFlashcardRetention = async (organizationId, userId) =>
  unwrapData(await api.get(ep.analyticsFlashcardRetention, { params: { organizationId, userId } }));

export const searchContent = async (organizationId, q, types) =>
  unwrapData(await api.get(ep.search, { params: { organizationId, q, types } }));

// --- Audit & jobs ---
export const getAuditLogs = async (organizationId, params = {}) =>
  fetchPaginated(api.get(ep.audit, { params: { organizationId, ...params } }));

export const getJobQueues = async () =>
  unwrapData(await api.get(ep.jobsQueues));

export const getQueueJobs = async (queue, params = {}) =>
  unwrapData(await api.get(ep.jobs, { params: { queue, ...params } }));

export const getFailedJobs = async (queue, params = {}) =>
  unwrapData(await api.get(ep.jobsFailed, { params: { queue, ...params } }));

export const getJob = async (jobId, queue) =>
  unwrapData(await api.get(ep.job(jobId), { params: { queue } }));

// --- Notifications ---
export const getNotifications = async (params = {}) =>
  fetchPaginated(api.get(ep.notifications, { params }));

export const markNotificationRead = async (id) =>
  unwrapData(await api.patch(ep.notificationRead(id)));

export const markAllNotificationsRead = async () =>
  unwrapData(await api.patch(ep.notificationsReadAll));

/** @deprecated use createMember */
export const addMember = createMember;
