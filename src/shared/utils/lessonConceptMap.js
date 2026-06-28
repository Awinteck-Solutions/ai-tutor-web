function slugify(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'section';
}

function inferNodeType(node) {
  const rawType = node?.type ?? node?.nodeType;
  if (rawType === 'page' || rawType === 'concept') return rawType;
  if (rawType === 'topic') return 'concept';

  const id = String(node?.id ?? '');
  if (id.startsWith('page:')) return 'page';
  if (id.startsWith('concept:')) return 'concept';
  return null;
}

export function normalizeConceptMap(conceptMap) {
  if (!conceptMap) return { nodes: [], edges: [] };

  const nodes = (Array.isArray(conceptMap.nodes) ? conceptMap.nodes : [])
    .map((node) => {
      const type = inferNodeType(node);
      if (!type || !node?.id) return null;

      return {
        ...node,
        type,
        title: node.title || String(node.id).replace(/^[^:]+:/, '') || 'Untitled',
        pageId:
          type === 'page'
            ? node.pageId ?? String(node.id).replace(/^page:/, '')
            : node.pageId,
      };
    })
    .filter(Boolean);

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = (Array.isArray(conceptMap.edges) ? conceptMap.edges : []).filter(
    (edge) => edge?.from && edge?.to && nodeIds.has(edge.from) && nodeIds.has(edge.to),
  );

  return { nodes, edges };
}

export function hasRenderableConceptMap(conceptMap) {
  const normalized = normalizeConceptMap(conceptMap);
  return normalized.nodes.some((node) => node.type === 'page' || node.type === 'concept');
}

export function splitLessonContentIntoPages(content, fallbackTitle = 'Introduction') {
  const body = content?.trim();
  if (!body) {
    return [{ id: 'intro', title: fallbackTitle, order: 0, content: '' }];
  }

  const sections = body.split(/\n(?=##\s+)/);
  const pages = [];

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index].trim();
    if (!section) continue;

    const headingMatch = section.match(/^##\s+(.+?)(?:\n|$)/);
    const title = headingMatch
      ? headingMatch[1].trim()
      : index === 0
        ? fallbackTitle
        : `Section ${index + 1}`;

    pages.push({
      id: `${slugify(title)}-${index}`,
      title,
      order: pages.length,
      content: section,
    });
  }

  return pages.length > 0
    ? pages
    : [{ id: 'intro', title: fallbackTitle, order: 0, content: body }];
}

function resolvePages(lesson, lessonContent) {
  if (lessonContent?.pages?.length) {
    return lessonContent.pages.map((page, index) => ({
      id: page.id,
      title: page.title,
      order: page.order ?? index,
      content: page.content ?? '',
    }));
  }

  if (lesson?.content?.trim()) {
    return splitLessonContentIntoPages(lesson.content, lesson?.title ?? 'Introduction');
  }

  return [{
    id: 'intro',
    title: lesson?.title ?? 'Introduction',
    order: 0,
    content: lesson?.summary ?? '',
  }];
}

export function buildConceptMapFromLessonData(lesson, lessonContent) {
  const pages = resolvePages(lesson, lessonContent);
  const concepts = lesson?.concepts ?? [];
  const nodes = [];
  const edges = [];

  pages.forEach((page) => {
    nodes.push({
      id: `page:${page.id}`,
      title: page.title,
      type: 'page',
      difficulty: lesson?.studentLevel,
      pageId: page.id,
    });
  });

  for (let index = 0; index < pages.length - 1; index += 1) {
    edges.push({
      from: `page:${pages[index].id}`,
      to: `page:${pages[index + 1].id}`,
      type: 'prerequisite',
    });
  }

  concepts.forEach((concept, index) => {
    const conceptId = `concept:${slugify(concept)}-${index}`;
    nodes.push({
      id: conceptId,
      title: concept,
      type: 'concept',
      difficulty: lesson?.studentLevel,
    });

    const matchedPage =
      pages.find((page) => page.content?.toLowerCase().includes(concept.toLowerCase()))
      ?? pages[0];

    if (matchedPage) {
      edges.push({
        from: conceptId,
        to: `page:${matchedPage.id}`,
        type: 'related',
      });
    }

    if (index > 0) {
      edges.push({
        from: `concept:${slugify(concepts[index - 1])}-${index - 1}`,
        to: conceptId,
        type: 'related',
      });
    }
  });

  return { nodes, edges };
}

export function overlayLessonStateOnConceptMap(conceptMap, lessonState) {
  const normalized = normalizeConceptMap(conceptMap);
  if (!normalized.nodes.length) return normalized;
  const completedPages = new Set(lessonState?.completedPages ?? []);
  const mastery = lessonState?.mastery ?? {};

  return {
    ...normalized,
    nodes: normalized.nodes.map((node) => ({
      ...node,
      completed:
        node.pageId != null ? completedPages.has(node.pageId) : node.completed,
      mastery:
        node.type === 'concept'
          ? mastery[node.id] ?? mastery[node.title] ?? node.mastery ?? 0
          : node.mastery,
    })),
  };
}

export function resolveConceptMapLocally(lesson, lessonContent, lessonState) {
  const built = buildConceptMapFromLessonData(lesson, lessonContent);
  if (!built.nodes.length) return null;
  return overlayLessonStateOnConceptMap(built, lessonState);
}

export function resolveConceptMapForView({
  conceptMap,
  lesson,
  lessonContent,
  lessonState,
}) {
  if (lesson) {
    const local = resolveConceptMapLocally(lesson, lessonContent, lessonState);
    if (local?.nodes?.length) return local;
  }

  const normalized = normalizeConceptMap(conceptMap);
  if (normalized.nodes.length) {
    return overlayLessonStateOnConceptMap(normalized, lessonState);
  }

  return null;
}
