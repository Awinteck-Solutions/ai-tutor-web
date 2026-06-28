import { Link } from 'react-router-dom';
import { Eye, Download, Sparkles, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import MarketplaceMarkdown from '../../Marketplace/components/MarketplaceMarkdown';

const MarketplaceListingCard = ({ listing, detailPath }) => {
  const { t } = useTranslation(['marketplace', 'common']);

  return (
    <Link to={detailPath} className="group block min-w-0 no-underline">
      <GlassCard className="flex h-full flex-col gap-3 p-4 transition hover:border-primary/40 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {listing.featured && (
              <AdesiaBadge status="active" className="!text-[10px]">
                {t('common:featured')}
              </AdesiaBadge>
            )}
            {listing.isImported && (
              <AdesiaBadge status="draft" className="!text-[10px]">
                {t('card.imported')}
              </AdesiaBadge>
            )}
            <AdesiaBadge status={listing.pricingType === 'free' ? 'active' : 'pending'} className="!text-[10px]">
              {listing.formattedPrice}
            </AdesiaBadge>
          </div>
          <AdesiaBadge status="ready" className="shrink-0 !text-[10px]">
            {listing.academicLevelLabel}
          </AdesiaBadge>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-11 sm:w-11">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
              {listing.title}
            </h3>
            {listing.subject && (
              <p className="mt-0.5 text-xs font-medium text-primary/80">{listing.subject}</p>
            )}
          </div>
        </div>

        <MarketplaceMarkdown
          content={listing.description}
          clamp={3}
          className="flex-1 text-sm leading-relaxed text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2">
          {(listing.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {listing.viewCount} {t('common:views')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {listing.downloadCount} {t('common:downloads')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {listing.flashcardCount > 0 && t('card.flashcards', { count: listing.flashcardCount })}
            {listing.flashcardCount > 0 && listing.quizQuestionCount > 0 && ' · '}
            {listing.quizQuestionCount > 0 && t('card.quiz', { count: listing.quizQuestionCount })}
          </span>
        </div>
      </GlassCard>
    </Link>
  );
};

export default MarketplaceListingCard;
