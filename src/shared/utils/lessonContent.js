/** Client-side fallback when API does not return nextLessonSuggestion. */
export function extractNextLessonSuggestion(content) {
  if (!content?.trim()) return null;
  const match = content.match(
    /##\s*Next Lesson Suggestion\s*\n+([\s\S]*?)(?=\n##\s|$)/i,
  );
  if (!match?.[1]?.trim()) return null;
  const text = match[1]
    .trim()
    .replace(/^[-*•]\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length >= 10 ? text.slice(0, 2000) : null;
}

export function groupPersonalLessons(lessons, groups = []) {
  const groupMap = new Map(groups.map((g) => [g.id, { ...g, lessons: [] }]));
  const ungrouped = [];
  const school = [];

  for (const lesson of lessons) {
    if (!lesson.isPersonal) {
      school.push(lesson);
      continue;
    }
    if (lesson.groupId && groupMap.has(lesson.groupId)) {
      groupMap.get(lesson.groupId).lessons.push(lesson);
    } else {
      ungrouped.push(lesson);
    }
  }

  const grouped = [...groupMap.values()]
    .map((g) => ({
      ...g,
      lessons: g.lessons.sort(
        (a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0)
          || new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
      ),
    }))
    .filter((g) => g.lessons.length > 0 || groups.some((x) => x.id === g.id))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return { school, grouped, ungrouped };
}
