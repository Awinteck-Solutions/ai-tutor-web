import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Library, Store } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader, EmptyState } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { CardGridSkeleton } from '../../../shared/components/TableSkeleton';
import DataListFooter from '../../../shared/components/DataListFooter';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { MARKETPLACE_ACADEMIC_LEVELS } from '../../../shared/constants/marketplace.constants';
import MarketplaceListingCard from '../components/MarketplaceListingCard';
import MarketplaceLibraryCard from '../components/MarketplaceLibraryCard';
import MarketplaceFiltersPanel from '../components/MarketplaceFiltersPanel';
import {
  getMarketplaceFilters,
  listMarketplaceLibrary,
  listMarketplaceListings,
} from '../services/marketplace.services';

const PAGE_SIZE = 9;

const defaultQuery = {
  search: '',
  academicLevel: '',
  pricingType: '',
  subject: '',
  featured: false,
  sort: 'newest',
  page: 1,
};

const MarketplacePage = ({ portalBase = '/student', getLessonPath }) => {
  const { t } = useTranslation(['marketplace', 'common']);
  const { organizationId } = useAuth();
  const [view, setView] = useState('browse');
  const [libraryType, setLibraryType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loadedKey, setLoadedKey] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    subjects: [],
    academicLevels: MARKETPLACE_ACADEMIC_LEVELS,
  });
  const [query, setQuery] = useState(defaultQuery);
  const requestIdRef = useRef(0);

  const browseContentKey = useMemo(
    () =>
      [
        'browse',
        query.search,
        query.academicLevel,
        query.pricingType,
        query.subject,
        query.featured,
        query.sort,
        query.page,
      ].join('|'),
    [query]
  );

  const libraryContentKey = useMemo(
    () => ['library', libraryType, query.page, organizationId ?? ''].join('|'),
    [libraryType, query.page, organizationId]
  );

  const contentKey = view === 'browse' ? browseContentKey : libraryContentKey;
  const canShowItems = !loading && loadedKey === contentKey;

  const hasActiveBrowseFilters =
    Boolean(query.search)
    || Boolean(query.academicLevel)
    || Boolean(query.pricingType)
    || Boolean(query.subject)
    || query.featured
    || query.sort !== defaultQuery.sort;

  const beginLoad = useCallback(() => {
    requestIdRef.current += 1;
    setLoading(true);
    setItems([]);
    setLoadedKey(null);
    return requestIdRef.current;
  }, []);

  const loadFilters = useCallback(async () => {
    try {
      const options = await getMarketplaceFilters();
      setFilterOptions({
        subjects: options.subjects ?? [],
        academicLevels: options.academicLevels?.length
          ? options.academicLevels
          : MARKETPLACE_ACADEMIC_LEVELS,
      });
    } catch {
      // keep defaults
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  const loadBrowse = useCallback(async () => {
    const requestId = beginLoad();
    const key = browseContentKey;

    try {
      const result = await listMarketplaceListings({
        search: query.search || undefined,
        academicLevel: query.academicLevel || undefined,
        pricingType: query.pricingType || undefined,
        subject: query.subject || undefined,
        featured: query.featured || undefined,
        sort: query.sort,
        page: query.page,
        limit: PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      setItems(result.items ?? []);
      setMeta(result.meta ?? { page: 1, pages: 1, total: 0 });
      setLoadedKey(key);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      notifications.show({
        title: t('messages.loadError'),
        message: getErrorMessage(err),
        color: 'red',
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [beginLoad, browseContentKey, query, t]);

  const loadLibrary = useCallback(async () => {
    const requestId = beginLoad();
    const key = libraryContentKey;

    if (!organizationId) {
      setMeta({ page: 1, pages: 1, total: 0 });
      setLoading(false);
      return;
    }

    try {
      const result = await listMarketplaceLibrary({
        organizationId,
        type: libraryType,
        page: query.page,
        limit: PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      setItems(result.items ?? []);
      setMeta(result.meta ?? { page: 1, pages: 1, total: 0 });
      setLoadedKey(key);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      notifications.show({
        title: t('messages.loadError'),
        message: getErrorMessage(err),
        color: 'red',
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [beginLoad, libraryContentKey, organizationId, libraryType, query.page, t]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (view === 'browse') {
      loadBrowse();
    } else {
      loadLibrary();
    }
  }, [view, loadBrowse, loadLibrary]);

  const updateQuery = (patch) => {
    beginLoad();
    setQuery((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  const clearFilters = () => {
    beginLoad();
    setQuery({ ...defaultQuery });
  };

  const switchView = (next) => {
    if (next === view) return;
    beginLoad();
    setView(next);
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  const switchLibraryType = (value) => {
    if (value === libraryType) return;
    beginLoad();
    setLibraryType(value);
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Store className="h-5 w-5" />
          </div>
        }
      />

      <SegmentedControl
        fullWidth
        value={view}
        onChange={switchView}
        data={[
          {
            value: 'browse',
            label: (
              <span className="inline-flex items-center justify-center gap-2 px-1 text-sm">
                <Store className="h-4 w-4" />
                {t('tabs.browse')}
              </span>
            ),
          },
          {
            value: 'library',
            label: (
              <span className="inline-flex items-center justify-center gap-2 px-1 text-sm">
                <Library className="h-4 w-4" />
                {t('tabs.library')}
              </span>
            ),
          },
        ]}
        classNames={{ label: 'py-2.5' }}
      />

      {view === 'browse' ? (
        <MarketplaceFiltersPanel
          query={query}
          filterOptions={filterOptions}
          filtersLoading={filtersLoading}
          onChange={updateQuery}
          onClear={clearFilters}
        />
      ) : (
        <GlassCard className="space-y-4 p-4 sm:p-5">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              {t('library.title')}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('library.description')}</p>
          </div>
          <SegmentedControl
            value={libraryType}
            onChange={switchLibraryType}
            data={[
              { value: 'all', label: t('library.filters.all') },
              { value: 'imported', label: t('library.filters.imported') },
              { value: 'purchased', label: t('library.filters.purchased') },
            ]}
            classNames={{ root: 'flex-wrap sm:flex-nowrap', label: 'text-xs sm:text-sm' }}
          />
        </GlassCard>
      )}

      {loading || !canShowItems ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        view === 'library' ? (
          <EmptyState
            icon={Library}
            title={t('library.emptyTitle')}
            description={t('library.empty')}
          />
        ) : hasActiveBrowseFilters ? (
          <GlassCard className="flex flex-col items-center px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">{t('emptyFiltered')}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              {t('filters.clear')}
            </button>
          </GlassCard>
        ) : (
          <EmptyState
            icon={Store}
            title={t('emptyComingSoon.title')}
            description={t('emptyComingSoon.description')}
          />
        )
      ) : (
        <>
          <div
            key={contentKey}
            className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {view === 'browse'
              ? items.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.id}
                    listing={listing}
                    detailPath={`${portalBase}/marketplace/${listing.id}`}
                  />
                ))
              : items.map((item) => (
                  <MarketplaceLibraryCard
                    key={item.id}
                    item={item}
                    detailPath={`${portalBase}/marketplace/${item.id}`}
                    lessonPath={getLessonPath}
                  />
                ))}
          </div>
          <DataListFooter
            page={meta.page}
            totalPages={meta.pages}
            totalItems={meta.total}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      )}
    </div>
  );
};

export default MarketplacePage;
