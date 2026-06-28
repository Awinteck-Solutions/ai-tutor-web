import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DollarSign, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { PageLoader } from '../../../shared/components/PageLoader';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import PlatformMarketplacePreviewModal from '../components/PlatformMarketplacePreviewModal';
import { platformMarketplaceStudentViewPath } from '../platform.paths';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getAdminMarketplaceStats } from '../../Marketplace/services/marketplace.services';

function formatRevenue(cents) {
  if (!cents) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function PlatformMarketplaceAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewListingId, setPreviewListingId] = useState(null);
  const [previewOpen, { open: openPreview, close: closePreview }] = useDisclosure(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statsResult = await getAdminMarketplaceStats();
      setStats(statsResult);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openPreviewModal = (row) => {
    setPreviewListingId(row.id);
    openPreview();
  };

  if (loading && !stats) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Marketplace analytics</h2>
        <p className="text-sm text-muted-foreground">
          Revenue, engagement, and top-performing listings across the catalog.
        </p>
      </div>

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase">Revenue</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold">
                {formatRevenue(stats.totalRevenueCents)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.paidPurchases)} paid purchases
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase">Views & imports</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold">
                {formatNumber(stats.totalViews)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.totalImports)} imports · {stats.conversionRate}% conversion
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase">Catalog</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold">
                {formatNumber(stats.publishedCount)}
              </p>
              <p className="text-xs text-muted-foreground">
                published · {formatNumber(stats.draftCount)} drafts · {formatNumber(stats.archivedCount)} archived
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase">Top performer</span>
              </div>
              <p className="mt-2 truncate font-display text-sm font-semibold">
                {stats.topListings?.[0]?.title ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.topListings?.[0]
                  ? `${stats.topListings[0].downloadCount} imports · ${stats.topListings[0].viewCount} views`
                  : 'No published listings yet'}
              </p>
            </GlassCard>
          </div>

          <GlassCard className="overflow-hidden p-0 sm:p-0">
            <div className="border-b border-border/50 px-4 py-3">
              <h3 className="font-display text-sm font-semibold">Top listings by imports</h3>
              <p className="text-xs text-muted-foreground">Published listings ranked by student imports.</p>
            </div>
            <AdesiaDataTable
              loading={loading}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'formattedPrice', label: 'Price' },
                {
                  key: 'viewCount',
                  label: 'Views',
                  render: (row) => formatNumber(row.viewCount),
                },
                {
                  key: 'downloadCount',
                  label: 'Imports',
                  render: (row) => formatNumber(row.downloadCount),
                },
                {
                  key: 'preview',
                  label: 'Actions',
                  render: (row) => (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        onClick={() => openPreviewModal(row)}
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </button>
                      <Link
                        to={platformMarketplaceStudentViewPath(row.slug ?? row.id)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        Student view
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={stats.topListings ?? []}
              emptyMessage="No published listings to rank yet."
            />
          </GlassCard>
        </>
      )}

      <PlatformMarketplacePreviewModal
        listingId={previewListingId}
        opened={previewOpen}
        onClose={() => {
          closePreview();
          setPreviewListingId(null);
        }}
      />
    </div>
  );
}
