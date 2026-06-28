import { Link } from 'react-router-dom';
import { BookOpen, Download, ExternalLink, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { GradientButton } from '../../../shared/components/GradientButton';
import MarketplaceMarkdown from '../../Marketplace/components/MarketplaceMarkdown';

const statusBadge = (status, t) => {
  if (status === 'purchased') {
    return { label: t('library.purchased'), tone: 'pending' };
  }
  if (status === 'purchased_and_imported') {
    return { label: t('library.purchasedImported'), tone: 'active' };
  }
  return { label: t('library.imported'), tone: 'ready' };
};

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const MarketplaceLibraryCard = ({ item, detailPath, lessonPath }) => {
  const { t } = useTranslation(['marketplace', 'common']);
  const badge = statusBadge(item.libraryStatus, t);
  const activityDate = item.importedAt || item.purchasedAt;

  return (
    <GlassCard className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <AdesiaBadge status={badge.tone} className="!text-[10px]">
          {badge.label}
        </AdesiaBadge>
        <AdesiaBadge status="ready" className="shrink-0 !text-[10px]">
          {item.academicLevelLabel}
        </AdesiaBadge>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display line-clamp-2 text-base font-semibold text-foreground sm:text-lg">
            {item.title}
          </h3>
          {item.subject && (
            <p className="mt-0.5 text-xs font-medium text-primary/80">{item.subject}</p>
          )}
        </div>
      </div>

      <MarketplaceMarkdown
        content={item.description}
        clamp={2}
        className="flex-1 text-sm text-muted-foreground"
      />

      <div className="space-y-1 text-xs text-muted-foreground">
        {item.purchasedAt && (
          <p className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" />
            {t('library.purchasedOn', { date: formatDate(item.purchasedAt) })}
          </p>
        )}
        {item.importedAt && (
          <p className="inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            {t('library.importedOn', { date: formatDate(item.importedAt) })}
          </p>
        )}
        {!item.purchasedAt && !item.importedAt && activityDate && (
          <p>{formatDate(activityDate)}</p>
        )}
      </div>

      <div className="mt-auto flex min-w-0 flex-col gap-2 sm:flex-row">
        {item.lessonId && lessonPath ? (
          <GradientButton
            to={lessonPath(item.lessonId)}
            className="w-full min-w-0 overflow-hidden !py-2 text-sm sm:flex-1"
            title={t('library.openLesson')}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{t('library.openLesson')}</span>
          </GradientButton>
        ) : (
          <GradientButton
            to={detailPath}
            className="w-full min-w-0 overflow-hidden !py-2 text-sm sm:flex-1"
            title={t('library.importNow')}
          >
            <span className="min-w-0 truncate">{t('library.importNow')}</span>
          </GradientButton>
        )}
        <Link
          to={detailPath}
          className="inline-flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-border/60 px-4 py-2 text-sm font-medium text-foreground no-underline transition hover:border-primary/40 hover:text-primary sm:flex-1"
          title={t('library.viewListing')}
        >
          <span className="min-w-0 truncate">{t('library.viewListing')}</span>
        </Link>
      </div>
    </GlassCard>
  );
};

export default MarketplaceLibraryCard;
