import { BASEURL } from '../../constants/api.constant';

export const lessonExperienceEndpoints = {
  lessonContent: (lessonId) => `${BASEURL}/lessons/${lessonId}/content`,
  lessonPage: (lessonId, pageId) =>
    `${BASEURL}/lessons/${lessonId}/content/pages/${pageId}`,
  lessonConceptMap: (lessonId) => `${BASEURL}/lessons/${lessonId}/concept-map`,
  lessonState: (lessonId, studentId) =>
    `${BASEURL}/lesson-state/${lessonId}/${studentId}`,
  lessonStateConceptMap: (lessonId, studentId) =>
    `${BASEURL}/lesson-state/${lessonId}/${studentId}/concept-map`,
  lessonStateProgress: `${BASEURL}/lesson-state/progress`,
  lessonStateNote: `${BASEURL}/lesson-state/note`,
  lessonStateHighlight: `${BASEURL}/lesson-state/highlight`,
  lessonStateBookmark: `${BASEURL}/lesson-state/bookmark`,
  learningDNA: (studentId) => `${BASEURL}/students/${studentId}/learning-dna`,
  studentLearningDNA: `${BASEURL}/student/learning-dna`,
};
