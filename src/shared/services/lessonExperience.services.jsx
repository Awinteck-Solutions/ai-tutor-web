import api from '../api/axios.instance';
import { lessonExperienceEndpoints as ep } from './lessonExperience.endpoints';
import { unwrapData } from '../utils/formatters';
import {
  hasRenderableConceptMap,
  normalizeConceptMap,
  overlayLessonStateOnConceptMap,
  resolveConceptMapLocally,
} from '../utils/lessonConceptMap';

const orgParam = (organizationId, extra = {}) => ({
  params: organizationId ? { organizationId, ...extra } : extra,
});

export const getLessonContentSummary = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonContent(lessonId), orgParam(organizationId)));

export const getLessonPage = async (lessonId, pageId, organizationId) =>
  unwrapData(await api.get(ep.lessonPage(lessonId, pageId), orgParam(organizationId)));

export const getLessonConceptMap = async (lessonId, organizationId) =>
  unwrapData(await api.get(ep.lessonConceptMap(lessonId), orgParam(organizationId)));

export const getLessonState = async (lessonId, studentId, organizationId) =>
  unwrapData(
    await api.get(ep.lessonState(lessonId, studentId), orgParam(organizationId)),
  );

export const getLessonStateConceptMap = async (lessonId, studentId, organizationId) =>
  unwrapData(
    await api.get(
      ep.lessonStateConceptMap(lessonId, studentId),
      orgParam(organizationId),
    ),
  );

export const updateLessonStateProgress = async (payload) =>
  unwrapData(await api.patch(ep.lessonStateProgress, payload));

export const addLessonStateNote = async (payload) =>
  unwrapData(await api.post(ep.lessonStateNote, payload));

export const addLessonStateHighlight = async (payload) =>
  unwrapData(await api.post(ep.lessonStateHighlight, payload));

export const toggleLessonStateBookmark = async (payload) =>
  unwrapData(await api.post(ep.lessonStateBookmark, payload));

export const getLearningDNA = async (organizationId, studentId) =>
  unwrapData(
    await api.get(
      studentId ? ep.learningDNA(studentId) : ep.studentLearningDNA,
      orgParam(organizationId),
    ),
  );

/** Load concept map with API fallbacks and local build from lesson content. */
export async function resolveConceptMap({
  lessonId,
  organizationId,
  userId,
  lesson,
  lessonContent,
  lessonState,
  initialMap,
}) {
  const local = resolveConceptMapLocally(lesson, lessonContent, lessonState);
  if (local?.nodes?.length) return local;

  if (initialMap?.nodes?.length && hasRenderableConceptMap(initialMap)) {
    return overlayLessonStateOnConceptMap(normalizeConceptMap(initialMap), lessonState);
  }

  const attempts = [];

  if (userId) {
    attempts.push(() => getLessonStateConceptMap(lessonId, userId, organizationId));
  }
  attempts.push(() => getLessonConceptMap(lessonId, organizationId));

  for (const attempt of attempts) {
    try {
      const map = await attempt();
      if (map?.nodes?.length && hasRenderableConceptMap(map)) {
        return overlayLessonStateOnConceptMap(normalizeConceptMap(map), lessonState);
      }
    } catch {
      // try next source
    }
  }

  return local;
}
