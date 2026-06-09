/** Group practice quizzes and flashcards by subject, then lesson. */
export const groupPracticeBySubject = (quizzes = [], flashcards = []) => {
  const subjectMap = new Map();

  const ensureSubject = (subjectId, subjectName) => {
    const key = subjectId || '_general';
    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subjectId: subjectId || '',
        subjectName: subjectName || 'General',
        lessons: new Map(),
      });
    }
    return subjectMap.get(key);
  };

  const ensureLesson = (subject, lessonId, lessonTitle) => {
    if (!subject.lessons.has(lessonId)) {
      subject.lessons.set(lessonId, {
        lessonId,
        lessonTitle: lessonTitle || 'Lesson',
        quizzes: [],
        flashcards: [],
      });
    }
    return subject.lessons.get(lessonId);
  };

  quizzes.forEach((q) => {
    const subject = ensureSubject(q.subjectId, q.subjectName);
    const lesson = ensureLesson(subject, q.lessonId, q.lessonTitle);
    lesson.quizzes.push(q);
  });

  flashcards.forEach((f) => {
    const subject = ensureSubject(f.subjectId, f.subjectName);
    const lesson = ensureLesson(subject, f.lessonId, f.lessonTitle);
    lesson.flashcards.push(f);
  });

  return [...subjectMap.values()].map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    lessons: [...s.lessons.values()].filter(
      (l) => l.quizzes.length > 0 || l.flashcards.length > 0,
    ),
  })).filter((s) => s.lessons.length > 0);
};
