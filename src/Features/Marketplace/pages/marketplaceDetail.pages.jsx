import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { CardGridSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import MarketplaceMarkdown from '../components/MarketplaceMarkdown';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  getMarketplaceListing,
  importMarketplaceListing,
  purchaseMarketplaceListing,
} from '../services/marketplace.services';

const MarketplaceDetailPage = ({
  portalBase = '/student',
  getLessonPath,
  readOnlyStudentPreview = false,
  backTo,
}) => {
  const { t } = useTranslation(['marketplace', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [listing, setListing] = useState(null);

  const load = async () => {
    setLoading(true);
    setListing(null);
    try {
      const data = await getMarketplaceListing(id);
      setListing(data);
    } catch (err) {
      notifications.show({
        title: t('messages.loadError'),
        message: getErrorMessage(err),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, organizationId]);

  const handleImport = async () => {
    if (!organizationId || listing?.isImported) return;
    setActing(true);
    try {
      const result = await importMarketplaceListing(id, organizationId);
      notifications.show({
        title: t('messages.importSuccess'),
        message: result.title,
        color: 'green',
      });
      if (result.lessonId && getLessonPath) {
        navigate(getLessonPath(result.lessonId));
      } else {
        await load();
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        notifications.show({
          title: t('messages.importExists'),
          message: getErrorMessage(err),
          color: 'orange',
        });
        await load();
      } else if (status === 402) {
        notifications.show({
          title: t('detail.purchaseFirst'),
          message: getErrorMessage(err),
          color: 'orange',
        });
      } else {
        notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
      }
    } finally {
      setActing(false);
    }
  };

  const handlePurchase = async () => {
    if (!organizationId) return;
    setActing(true);
    try {
      await purchaseMarketplaceListing(id, organizationId);
      notifications.show({
        title: t('messages.purchaseSuccess'),
        message: '',
        color: 'green',
      });
      await load();
    } catch (err) {
      notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 space-y-4 sm:space-y-6">
        <CardGridSkeleton count={1} />
      </div>
    );
  }
  if (!listing) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">{t('messages.loadError')}</p>
        <Link to={`${portalBase}/marketplace`} className="mt-4 inline-block text-primary">
          {t('title')}
        </Link>
      </GlassCard>
    );
  }

  const needsPurchase =
    listing.pricingType === 'paid' && listing.priceCents > 0 && !listing.hasAccess;
  const importedLessonPath =
    !readOnlyStudentPreview &&
    listing.isImported &&
    listing.importedLessonId &&
    getLessonPath
      ? getLessonPath(listing.importedLessonId)
      : null;

  const backLink = backTo ?? `${portalBase}/marketplace`;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <Link
        to={backLink}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {readOnlyStudentPreview ? 'Back to listings' : t('title')}
      </Link>

      {readOnlyStudentPreview && (
        <p className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold text-primary">Student catalog preview</span>
          {' — '}
          This is how students see a published listing. Import and purchase actions are not shown here.
        </p>
      )}

      <PageHeader title={listing.title} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="space-y-4 p-4 sm:p-6">
            {listing.description && (
              <MarketplaceMarkdown content={listing.description} />
            )}

            <div className="flex flex-wrap gap-2">
              <AdesiaBadge status="ready">{listing.academicLevelLabel}</AdesiaBadge>
              <AdesiaBadge status={listing.pricingType === 'free' ? 'active' : 'pending'}>
                {listing.formattedPrice}
              </AdesiaBadge>
              {listing.subject && <AdesiaBadge status="draft">{listing.subject}</AdesiaBadge>}
              {listing.featured && <AdesiaBadge status="active">{t('common:featured')}</AdesiaBadge>}
              {listing.isImported && (
              <AdesiaBadge status="draft">{t('card.imported')}</AdesiaBadge>
            )}
          </div>
          {listing.isImported && (
            <p className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {t('messages.importExists')}
            </p>
          )}

            {listing.summary && (
              <div>
                <h3 className="font-display text-sm font-semibold sm:text-base">Summary</h3>
                <div className="mt-2">
                  <MarketplaceMarkdown content={listing.summary} />
                </div>
              </div>
            )}

            {listing.objectives?.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-semibold sm:text-base">
                  {t('detail.objectives')}
                </h3>
                <ul className="mt-2 space-y-2">
                  {listing.objectives.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground">
                      <MarketplaceMarkdown content={item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.contentPreview && (
              <div>
                <h3 className="font-display text-sm font-semibold sm:text-base">
                  {t('detail.preview')}
                </h3>
                <div className="mt-3">
                  <MarketplaceMarkdown content={listing.contentPreview} />
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="space-y-4 p-4 sm:p-6">
            <h3 className="font-display text-sm font-semibold">{t('detail.stats')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border/50 p-3">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {t('common:views')}
                </span>
                <p className="mt-1 text-xl font-semibold">{listing.viewCount}</p>
              </div>
              <div className="rounded-xl border border-border/50 p-3">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  {t('common:downloads')}
                </span>
                <p className="mt-1 text-xl font-semibold">{listing.downloadCount}</p>
              </div>
            </div>

            {(listing.flashcardCount > 0 || listing.quizQuestionCount > 0) && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                {listing.flashcardCount > 0 &&
                  t('card.flashcards', { count: listing.flashcardCount })}
                {listing.flashcardCount > 0 && listing.quizQuestionCount > 0 && ' · '}
                {listing.quizQuestionCount > 0 &&
                  t('card.quiz', { count: listing.quizQuestionCount })}
              </p>
            )}

            {!readOnlyStudentPreview && (
            <div className="flex flex-col gap-2 pt-2">
              {listing.isImported ? (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    {t('messages.importExists')}
                  </p>
                  {importedLessonPath ? (
                    <GradientButton to={importedLessonPath} className="w-full !py-2.5">
                      {t('detail.importAgain')}
                    </GradientButton>
                  ) : null}
                </>
              ) : needsPurchase ? (
                <>
                  <GradientButton
                    type="button"
                    disabled={acting || !organizationId}
                    onClick={handlePurchase}
                    className="w-full !py-2.5"
                  >
                    {acting ? t('common:loading') : t('detail.purchaseCta')} ({listing.formattedPrice})
                  </GradientButton>
                  <p className="text-center text-xs text-muted-foreground">
                    {t('detail.purchaseFirst')}
                  </p>
                </>
              ) : (
                <GradientButton
                  type="button"
                  disabled={acting || !organizationId}
                  onClick={handleImport}
                  className="w-full !py-2.5"
                >
                  {acting ? t('common:loading') : t('detail.importCta')}
                </GradientButton>
              )}
            </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetailPage;
