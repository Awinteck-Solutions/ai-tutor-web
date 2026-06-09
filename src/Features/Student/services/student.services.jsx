import api from '../../../shared/api/axios.instance';
import { studentEndpoints as ep } from '../student.endpoints';
import {
  normalizeStudentDashboard,
  unwrapData,
  unwrapList,
  unwrapPaginated,
} from '../../../shared/utils/formatters';

const orgParam = (organizationId, extra = {}) => ({
  params: { organizationId, ...extra },
});

export const getDashboard = async (organizationId) => {
  const res = await api.get(ep.dashboard, orgParam(organizationId));
  return normalizeStudentDashboard(unwrapData(res));
};

export const getContinueLearning = async (organizationId) =>
  unwrapList(unwrapData(await api.get(ep.continueLearning, orgParam(organizationId))));

export const getLessons = async (organizationId) =>
  unwrapList(unwrapData(await api.get(ep.lessons, orgParam(organizationId))));

export const getLessonDetail = async (organizationId, lessonId) =>
  unwrapData(await api.get(ep.lesson(lessonId), orgParam(organizationId)));

/** Source materials linked to a lesson (shared lessons API). */
export const getLessonSources = async (organizationId, lessonId) =>
  unwrapData(
    await api.get(`/lessons/${lessonId}/sources`, orgParam(organizationId)),
  );

export const getMaterial = async (materialId, organizationId) =>
  unwrapData(
    await api.get(`/materials/${materialId}`, orgParam(organizationId)),
  );

export const getMaterialChunks = async (materialId, organizationId) =>
  unwrapData(
    await api.get(`/materials/${materialId}/chunks`, orgParam(organizationId)),
  );

export const completeLesson = async (lessonId) =>
  unwrapData(await api.post(ep.lessonComplete(lessonId)));

export const getRecommendations = async (organizationId) =>
  unwrapData(await api.get(ep.recommendations, orgParam(organizationId)));

export const getAchievements = async (organizationId) =>
  unwrapData(await api.get(ep.achievements, orgParam(organizationId)));

export const getStudyQueue = async (organizationId) =>
  unwrapData(await api.get(ep.studyQueue, orgParam(organizationId)));

export const getPractice = async (organizationId) =>
  unwrapData(await api.get(ep.practice, orgParam(organizationId)));

export const getLeaderboard = async (organizationId, scope = 'organization') =>
  unwrapData(await api.get(ep.leaderboard, orgParam(organizationId, { scope })));

export const submitFlashcardReview = async (flashcardId, result) =>
  unwrapData(await api.post(ep.flashcardReview(flashcardId), { result }));

export const submitQuiz = async (quizId, payload) =>
  unwrapData(await api.post(ep.quizSubmit(quizId), payload));

export const submitQuizPractice = async (quizId, payload) =>
  unwrapData(await api.post(ep.quizSubmit(quizId), { ...payload, practice: true }));

export const getQuizDraft = async (quizId) =>
  unwrapData(await api.get(ep.quizDraft(quizId)));

export const saveQuizDraft = async (quizId, payload) =>
  unwrapData(await api.put(ep.quizDraft(quizId), payload));

export const getRevisionPlan = async (organizationId) =>
  unwrapData(await api.get(ep.revisionPlan, orgParam(organizationId)));

export const getSubscription = async (organizationId) =>
  unwrapData(await api.get(ep.subscription, orgParam(organizationId)));

export const provisionWorkspace = async () =>
  unwrapData(await api.post(ep.provisionWorkspace));

export const sendChatMessage = async (organizationId, message, options = {}) => {
  const body = { organizationId, message };
  ['sessionId', 'lessonId', 'quizId', 'flashcardId', 'topicId', 'materialId'].forEach((key) => {
    if (options[key]) body[key] = options[key];
  });
  return unwrapData(await api.post(ep.chat, body));
};

export const listChatSessions = async (organizationId) =>
  unwrapList(unwrapData(await api.get(ep.chatSessions, orgParam(organizationId))));

export const getChatSession = async (sessionId) =>
  unwrapData(await api.get(ep.chatSession(sessionId)));

export const renameChatSession = async (sessionId, title) =>
  unwrapData(
    await api.patch(ep.chatSession(sessionId), { title }),
  );

export const deleteChatSession = async (sessionId) =>
  unwrapData(await api.delete(ep.chatSession(sessionId)));

export const createPersonalLesson = async (organizationId, payload) =>
  unwrapData(
    await api.post(ep.selfStudyLessons, { organizationId, ...payload }),
  );

export const createPersonalLessonFromMaterials = async (organizationId, payload) =>
  unwrapData(
    await api.post(ep.selfStudyLessonsFromMaterials, { organizationId, ...payload }),
  );

export const listSelfStudyMaterials = async (organizationId, params = {}) =>
  unwrapPaginated(
    await api.get(ep.selfStudyMaterials, orgParam(organizationId, params)),
  );

export const uploadSelfStudyPdf = async (formData) =>
  unwrapData(
    await api.post(ep.selfStudyUploadPdf, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );

export const uploadSelfStudyText = async (payload) =>
  unwrapData(await api.post(ep.selfStudyUploadText, payload));

export const uploadSelfStudyYoutube = async (payload) =>
  unwrapData(await api.post(ep.selfStudyUploadYoutube, payload));

export const deleteSelfStudyMaterial = async (organizationId, materialId) =>
  unwrapData(
    await api.delete(ep.selfStudyMaterial(materialId), orgParam(organizationId)),
  );

export const addMaterialsToPersonalLesson = async (organizationId, lessonId, payload) =>
  unwrapData(
    await api.post(
      ep.selfStudyLessonMaterials(lessonId),
      payload,
      orgParam(organizationId),
    ),
  );

export const listPersonalLessons = async (organizationId, params = {}) =>
  unwrapPaginated(
    await api.get(ep.selfStudyLessons, orgParam(organizationId, params)),
  );

export const getSelfStudyStatus = async (organizationId, lessonId) =>
  unwrapData(
    await api.get(ep.selfStudyLessonStatus(lessonId), orgParam(organizationId)),
  );

export const regeneratePersonalLesson = async (organizationId, lessonId, payload = {}) =>
  unwrapData(
    await api.post(
      ep.selfStudyLessonRegenerate(lessonId),
      payload,
      orgParam(organizationId),
    ),
  );

export const generateLessonFlashcards = async (organizationId, lessonId, options) =>
  unwrapData(
    await api.post(ep.selfStudyFlashcards(lessonId), options, orgParam(organizationId)),
  );

export const generateLessonQuiz = async (organizationId, lessonId, options) =>
  unwrapData(
    await api.post(ep.selfStudyQuiz(lessonId), options, orgParam(organizationId)),
  );

export const getNotes = async (organizationId, filters = {}) =>
  unwrapList(
    unwrapData(
      await api.get(ep.notes, {
        params: { organizationId, ...filters },
      }),
    ),
  );

export const saveNote = async (organizationId, payload) => {
  const body = { organizationId, ...payload };
  if (!body.id) delete body.id;
  return unwrapData(await api.put(ep.notes, body));
};

export const deleteNote = async (noteId) =>
  unwrapData(await api.delete(ep.note(noteId)));

export const getMilestones = async (organizationId) =>
  unwrapData(await api.get(ep.milestones, orgParam(organizationId)));

export const getNotifications = async (params = {}) =>
  unwrapPaginated(await api.get(ep.notifications, { params }));

export const markNotificationRead = async (id) =>
  unwrapData(await api.patch(ep.notificationRead(id)));

export const markAllNotificationsRead = async () =>
  unwrapData(await api.patch(ep.notificationsReadAll));
