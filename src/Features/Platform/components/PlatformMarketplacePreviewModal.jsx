import { useEffect, useState } from 'react';
import { Modal, Tabs } from '@mantine/core';
import {
  BookOpen, Brain, ClipboardList, Eye, Layers, Sparkles, Target,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { GlassCard } from '../../../shared/components/GlassCard';
import MarketplaceMarkdown from '../../Marketplace/components/MarketplaceMarkdown';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import StatusBadge from '../../../shared/components/StatusBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getAdminMarketplaceListing } from '../../Marketplace/services/marketplace.services';

export default function PlatformMarketplacePreviewModal({ listingId, opened, onClose }) {
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!opened || !listingId) {
      setListing(null);
      setTab('overview');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    getAdminMarketplaceListing(listingId)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        notifications.show({ title: 'Preview failed', message: getErrorMessage(err), color: 'red' });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [opened, listingId, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={listing?.title ? `Preview · ${listing.title}` : 'Lesson preview'}
      size="xl"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      classNames={{
        title: 'font-display font-semibold text-foreground pr-8',
        header: 'border-b border-border/50',
        content: 'glass-card !bg-card max-h-[90vh]',
        body: 'max-h-[calc(90vh-4rem)] overflow-y-auto pt-4',
      }}
    >
      {loading && !listing ? (
        <PageLoader />
      ) : listing ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <AdesiaBadge
              status={
                listing.status === 'published'
                  ? 'active'
                  : listing.status === 'archived'
                    ? 'failed'
                    : 'draft'
              }
            >
              {listing.status === 'published'
                ? 'Published'
                : listing.status === 'archived'
                  ? 'Archived'
                  : 'Draft'}
            </AdesiaBadge>
            <AdesiaBadge status="ready">{listing.academicLevelLabel}</AdesiaBadge>
            <AdesiaBadge status={listing.pricingType === 'free' ? 'active' : 'pending'}>
              {listing.formattedPrice}
            </AdesiaBadge>
            {listing.featured && <AdesiaBadge status="active">Featured</AdesiaBadge>}
            {listing.sourceLessonId && (
              <StatusBadge status={listing.sourceGenerationStatus ?? 'PENDING'} />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <GlassCard className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Flashcards</p>
                <p className="font-semibold">{listing.flashcardCount ?? listing.flashcards?.length ?? 0}</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quiz questions</p>
                <p className="font-semibold">{listing.quizQuestionCount ?? listing.quizQuestions?.length ?? 0}</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-sm font-semibold">
                  {listing.viewCount} views · {listing.downloadCount} imports
                </p>
              </div>
            </GlassCard>
          </div>

          <Tabs value={tab} onChange={setTab}>
            <Tabs.List className="flex-nowrap overflow-x-auto border-b border-border/50 pb-px">
              <Tabs.Tab value="overview" leftSection={<BookOpen className="h-3.5 w-3.5" />}>
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="lesson" leftSection={<Sparkles className="h-3.5 w-3.5" />}>
                Lesson
              </Tabs.Tab>
              <Tabs.Tab value="flashcards" leftSection={<Layers className="h-3.5 w-3.5" />}>
                Flashcards
              </Tabs.Tab>
              <Tabs.Tab value="quiz" leftSection={<Brain className="h-3.5 w-3.5" />}>
                Quiz
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md" className="space-y-4">
              <MarketplaceMarkdown content={listing.description} />
              {listing.summary && (
                <GlassCard className="p-4">
                  <h4 className="mb-2 font-display text-sm font-semibold">Summary</h4>
                  <MarketplaceMarkdown content={listing.summary} />
                </GlassCard>
              )}
              {listing.objectives?.length > 0 && (
                <GlassCard className="p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
                    <Target className="h-4 w-4 text-primary" />
                    Learning objectives
                  </h4>
                  <ul className="space-y-2">
                    {listing.objectives.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        <MarketplaceMarkdown content={item} />
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
              {(listing.tags?.length > 0 || listing.subject) && (
                <div className="flex flex-wrap gap-2">
                  {listing.subject && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {listing.subject}
                    </span>
                  )}
                  {(listing.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="lesson" pt="md">
              {listing.content ? (
                <GlassCard className="p-4 sm:p-6">
                  <MarketplaceMarkdown content={listing.content} />
                </GlassCard>
              ) : (
                <EmptyPreview message="Lesson content will appear after AI generation completes." />
              )}
            </Tabs.Panel>

            <Tabs.Panel value="flashcards" pt="md" className="space-y-3">
              {(listing.flashcards ?? []).length > 0 ? (
                listing.flashcards.map((card, index) => (
                  <GlassCard key={`${card.question}-${index}`} className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Card {index + 1}
                      {card.difficulty ? ` · ${card.difficulty}` : ''}
                    </p>
                    <div className="mt-2 font-medium text-foreground">
                      <MarketplaceMarkdown content={card.question} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <MarketplaceMarkdown content={card.answer} />
                    </div>
                  </GlassCard>
                ))
              ) : (
                <EmptyPreview message="No flashcards yet — they sync when generation completes." />
              )}
            </Tabs.Panel>

            <Tabs.Panel value="quiz" pt="md" className="space-y-3">
              {(listing.quizQuestions ?? []).length > 0 ? (
                listing.quizQuestions.map((question, index) => (
                  <GlassCard key={`${question.question}-${index}`} className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Question {index + 1}
                      {question.type ? ` · ${question.type}` : ''}
                    </p>
                    <div className="mt-2 font-medium text-foreground">
                      <MarketplaceMarkdown content={question.question} />
                    </div>
                    {question.options?.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {question.options.map((option) => (
                          <li
                            key={option}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              option === question.correctAnswer
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground'
                                : 'border-border/50 text-muted-foreground'
                            }`}
                          >
                            <MarketplaceMarkdown content={option} className="inline" />
                            {option === question.correctAnswer && (
                              <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Correct
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!question.options?.length && question.correctAnswer && (
                      <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                        Answer: <MarketplaceMarkdown content={question.correctAnswer} className="inline" />
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <MarketplaceMarkdown content={question.explanation} />
                      </div>
                    )}
                  </GlassCard>
                ))
              ) : (
                <EmptyPreview message="No quiz questions yet — they sync when generation completes." />
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      ) : null}
    </Modal>
  );
}

function EmptyPreview({ message }) {
  return (
    <GlassCard className="p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </GlassCard>
  );
}
