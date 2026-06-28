import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles,
} from 'lucide-react';
import MarkdownContent from './MarkdownContent';
import { GradientButton } from './GradientButton';
import {
  getLessonPage,
  toggleLessonStateBookmark,
  updateLessonStateProgress,
} from '../services/lessonExperience.services';

function ActionLoader({ label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
      <span className="bg-[length:200%_100%] bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text text-transparent animate-shimmer-slide">
        {label}
      </span>
    </span>
  );
}

export default function LessonContentViewer({
  lessonId,
  organizationId,
  contentSummary,
  lessonState,
  onStateChange,
  readOnly = false,
}) {
  const pages = contentSummary?.pages ?? [];
  const [activePageId, setActivePageId] = useState(
    lessonState?.currentPageId ?? pages[0]?.id ?? null,
  );
  const [pageContent, setPageContent] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [bookmarkSuccess, setBookmarkSuccess] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [completingPageId, setCompletingPageId] = useState(null);

  const activeIndex = useMemo(
    () => pages.findIndex((page) => page.id === activePageId),
    [pages, activePageId],
  );

  const completedSet = useMemo(
    () => new Set(lessonState?.completedPages ?? []),
    [lessonState?.completedPages],
  );

  const bookmarkSet = useMemo(
    () => new Set(lessonState?.bookmarks ?? []),
    [lessonState?.bookmarks],
  );

  useEffect(() => {
    if (lessonState?.currentPageId) {
      setActivePageId(lessonState.currentPageId);
    } else if (pages[0]?.id) {
      setActivePageId(pages[0].id);
    }
  }, [lessonState?.currentPageId, pages]);

  const loadPage = useCallback(async (pageId) => {
    if (!pageId || !lessonId) return;
    setLoadingPage(true);
    try {
      const page = await getLessonPage(lessonId, pageId, organizationId);
      setPageContent(page);
    } catch {
      setPageContent(null);
    } finally {
      setLoadingPage(false);
    }
  }, [lessonId, organizationId]);

  useEffect(() => {
    if (activePageId) loadPage(activePageId);
  }, [activePageId, loadPage]);

  const persistProgress = async (nextPageId, extra = {}) => {
    if (readOnly || !lessonId) return;
    setNavigating(true);
    try {
      const updated = await updateLessonStateProgress({
        lessonId,
        currentPageId: nextPageId,
        ...extra,
      });
      onStateChange?.(updated);
    } finally {
      setNavigating(false);
    }
  };

  const goToPage = async (pageId) => {
    setActivePageId(pageId);
    await persistProgress(pageId);
  };

  const markPageComplete = async () => {
    if (!activePageId || completeLoading) return;
    setCompleteLoading(true);
    setCompletingPageId(activePageId);
    try {
      const updated = await updateLessonStateProgress({
        lessonId,
        currentPageId: activePageId,
        completedPageId: activePageId,
      });
      onStateChange?.(updated);
      setCompleteSuccess(true);
      window.setTimeout(() => setCompleteSuccess(false), 2200);
    } finally {
      setCompleteLoading(false);
      setCompletingPageId(null);
    }
  };

  const goNext = async () => {
    if (activeIndex < 0 || activeIndex >= pages.length - 1) return;
    const next = pages[activeIndex + 1];
    await goToPage(next.id);
  };

  const goPrev = async () => {
    if (activeIndex <= 0) return;
    const prev = pages[activeIndex - 1];
    await goToPage(prev.id);
  };

  const toggleBookmark = async () => {
    if (readOnly || !activePageId || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const updated = await toggleLessonStateBookmark({
        lessonId,
        pageId: activePageId,
      });
      onStateChange?.(updated);
      setBookmarkSuccess(true);
      window.setTimeout(() => setBookmarkSuccess(false), 1800);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (!pages.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Lesson pages will appear once content is generated.
      </p>
    );
  }

  const activePage = pages[activeIndex] ?? pages[0];
  const isBookmarked = bookmarkSet.has(activePageId);
  const isCompleted = completedSet.has(activePageId);
  const actionBusy = bookmarkLoading || completeLoading;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="glass-card max-h-[520px] overflow-y-auto p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pages ({pages.length})
        </p>
        <ul className="space-y-1">
          {pages.map((page, index) => {
            const done = completedSet.has(page.id);
            const active = page.id === activePageId;
            const isCompletingThis = completingPageId === page.id && completeLoading;
            return (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => goToPage(page.id)}
                  disabled={navigating || actionBusy}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
                    active
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  } ${done ? 'border border-emerald-500/20' : ''}`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[10px] font-semibold">
                    {isCompletingThis ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : done ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium">{page.title}</span>
                    {done && !isCompletingThis && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        Done
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="glass-card relative flex min-w-0 flex-col overflow-hidden p-5">
        {completeSuccess && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-3 animate-action-success">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-800 shadow-glow-sm dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Page complete — nice work!
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Page {activeIndex + 1} of {pages.length}
            </p>
            <h3 className="font-display text-lg font-semibold">{activePage?.title}</h3>
          </div>
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn-outline relative min-w-[7.5rem] !px-2.5 !py-1.5 text-xs transition-all ${
                  bookmarkSuccess ? 'border-primary/50 bg-primary/10 ring-2 ring-primary/20' : ''
                } ${bookmarkLoading ? 'cursor-wait opacity-90' : ''}`}
                onClick={toggleBookmark}
                disabled={bookmarkLoading || completeLoading}
              >
                {bookmarkLoading ? (
                  <ActionLoader label={isBookmarked ? 'Removing…' : 'Saving…'} />
                ) : bookmarkSuccess ? (
                  <span className="inline-flex animate-action-success items-center gap-1.5 text-primary">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Saved!
                  </span>
                ) : (
                  <>
                    {isBookmarked ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5" />
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </>
                )}
              </button>
              {!isCompleted && (
                <GradientButton
                  type="button"
                  className={`relative min-w-[9rem] !px-2.5 !py-1.5 text-xs ${
                    completeLoading ? 'cursor-wait opacity-90' : ''
                  }`}
                  onClick={markPageComplete}
                  disabled={completeLoading || bookmarkLoading}
                >
                  {completeLoading ? (
                    <ActionLoader label="Marking done…" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark page done
                    </>
                  )}
                </GradientButton>
              )}
              {isCompleted && !completeLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative min-h-[200px] flex-1">
          {loadingPage && (
            <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm">
              <div className="relative">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <div className="absolute inset-1 animate-pulse rounded-full bg-primary/10" />
              </div>
              <p className="text-sm text-muted-foreground">Loading page…</p>
            </div>
          )}
          {pageContent?.content ? (
            <MarkdownContent content={pageContent.content} />
          ) : !loadingPage ? (
            <p className="text-sm text-muted-foreground">No content for this page.</p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <button
            type="button"
            className="btn-outline !px-3 !py-2 text-sm"
            onClick={goPrev}
            disabled={activeIndex <= 0 || navigating || actionBusy}
          >
            {navigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            Previous
          </button>
          <button
            type="button"
            className="btn-outline !px-3 !py-2 text-sm"
            onClick={goNext}
            disabled={activeIndex >= pages.length - 1 || navigating || actionBusy}
          >
            Next
            {navigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
