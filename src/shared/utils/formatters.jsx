/** Peel axios response and nested { success, data } API envelopes. */
export const unwrapData = (response) => {
  let body = response?.data ?? response;
  while (
    body
    && typeof body === 'object'
    && body.success === true
    && body.data !== undefined
  ) {
    body = body.data;
  }
  return body;
};

/** Teacher dashboard stats from GET /teacher/dashboard */
export const normalizeTeacherDashboard = (payload) => {
  if (payload == null) return null;
  let d = payload;
  while (d && typeof d === 'object' && d.success === true && d.data !== undefined) {
    d = d.data;
  }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;

  const n = (v) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };

  if (
    d.totalSubjects == null
    && d.totalStudents == null
    && d.subjects == null
    && d.students == null
  ) {
    return null;
  }

  return {
    totalStudents: n(d.totalStudents ?? d.students),
    totalSubjects: n(d.totalSubjects ?? d.subjects),
    totalTopics: n(d.totalTopics ?? d.topics),
    totalLessons: n(d.totalLessons ?? d.lessons),
    totalMaterials: n(d.totalMaterials ?? d.materials),
    totalQuizzes: n(d.totalQuizzes ?? d.quizzes),
    totalFlashcards: n(d.totalFlashcards ?? d.flashcards),
    completionRate: n(d.completionRate),
    averageScore: n(d.averageScore ?? d.averageQuizScore),
    contentBySubject: Array.isArray(d.contentBySubject) ? d.contentBySubject : [],
    recentActivity: Array.isArray(d.recentActivity) ? d.recentActivity : [],
    atRiskStudents: Array.isArray(d.atRiskStudents) ? d.atRiskStudents : [],
    focusLessons: Array.isArray(d.focusLessons) ? d.focusLessons : [],
  };
};

/** Student dashboard stats from GET /student/dashboard */
export const normalizeStudentDashboard = (payload) => {
  if (payload == null) return null;
  let d = payload;
  while (d && typeof d === 'object' && d.success === true && d.data !== undefined) {
    d = d.data;
  }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;

  const n = (v) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };

  const currentLessons = Array.isArray(d.currentLessons) ? d.currentLessons : [];
  const recommendedLessons = Array.isArray(d.recommendedLessons)
    ? d.recommendedLessons
    : Array.isArray(d.nextLessons)
      ? d.nextLessons
      : [];

  return {
    lessonsCompleted: n(d.lessonsCompleted),
    totalLessons: n(d.totalLessons),
    lessonCompletionRate: n(d.lessonCompletionRate ?? d.completionPercentage),
    quizzesTaken: n(d.quizzesTaken),
    averageQuizScore: n(d.averageQuizScore),
    flashcardsReviewed: n(d.flashcardsReviewed),
    flashcardAccuracy: n(d.flashcardAccuracy),
    totalStudyTimeMinutes: n(d.totalStudyTimeMinutes ?? d.studyTime),
    currentStreak: n(d.currentStreak ?? d.streak),
    longestStreak: n(d.longestStreak),
    dueFlashcards: n(d.nextReviews),
    pendingQuizzes: n(d.pendingQuizzes),
    weakTopics: Array.isArray(d.weakTopics) ? d.weakTopics : [],
    currentLessons,
    recommendedLessons,
    totalXp: n(d.totalXp),
    orgRank: n(d.orgRank),
    globalRank: n(d.globalRank),
  };
};

/** Extract list items from paginated API responses ({ items, meta }) or legacy shapes. */
export const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  return data.items ?? data.materials ?? data.lessons ?? data.members ?? data.logs ?? [];
};

export const unwrapPaginated = (response) => {
  const data = unwrapData(response);
  if (Array.isArray(data)) {
    return { items: data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
  }
  const items = unwrapList(data);
  const total = Number(data?.meta?.total);
  const limit = Number(data?.meta?.limit) || items.length || 1;
  const resolvedTotal = Number.isFinite(total) && total >= 0 ? total : items.length;
  const totalPages = Number(data?.meta?.totalPages)
    || Math.max(1, Math.ceil(resolvedTotal / limit));

  return {
    items,
    meta: {
      ...(data?.meta ?? {}),
      total: resolvedTotal,
      limit,
      totalPages,
      page: Number(data?.meta?.page) || 1,
    },
  };
};

export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback;

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

/** Date with time — e.g. Wed, 12 Mar 2026, 23:47 */
export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(value)}, ${time}`;
};

export const formatBytes = (bytes) => {
  if (bytes == null) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
};

export const parseAiUsage = (usage) => {
  if (usage == null) return { requests: 0, tokens: 0 };
  if (typeof usage === 'number') return { requests: usage, tokens: 0 };
  if (typeof usage === 'object') {
    return {
      requests: usage.requests ?? 0,
      tokens: usage.tokens ?? 0,
    };
  }
  return { requests: 0, tokens: 0 };
};

/** Compact string fallback */
export const formatAiUsage = (usage) => {
  const { requests, tokens } = parseAiUsage(usage);
  return `${requests.toLocaleString()} requests · ${tokens.toLocaleString()} tokens`;
};

export const formatNumber = (n) => {
  if (n == null) return '—';
  return Number(n).toLocaleString();
};

export const formatDateShort = (value) => formatDate(value);

export const formatDateForApi = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const parseApiDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
