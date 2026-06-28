import { Checkbox, Select, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';

const MarketplaceFiltersPanel = ({
  query,
  filterOptions,
  filtersLoading,
  onChange,
  onClear,
}) => {
  const { t } = useTranslation(['marketplace', 'common']);

  const academicOptions = [
    { value: '', label: t('common:all') },
    ...filterOptions.academicLevels.map((level) => ({
      value: level.value,
      label: level.label,
    })),
  ];

  const subjectOptions = [
    { value: '', label: t('common:all') },
    ...filterOptions.subjects.map((subject) => ({ value: subject, label: subject })),
  ];

  const hasActiveFilters =
    query.search ||
    query.academicLevel ||
    query.pricingType ||
    query.subject ||
    query.featured;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="border-b border-border/40 p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-primary" />
          {t('filters.search')}
        </div>
        <TextInput
          placeholder={t('searchPlaceholder')}
          leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
          value={query.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="space-y-4 border-b border-border/40 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {t('filters.refine')}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Select
              label={t('filters.academicLevel')}
              placeholder={t('common:all')}
              data={academicOptions}
              value={query.academicLevel}
              onChange={(value) => onChange({ academicLevel: value ?? '' })}
              disabled={filtersLoading}
              searchable
            />
            <Select
              label={t('filters.subject')}
              placeholder={t('common:all')}
              data={subjectOptions}
              value={query.subject}
              onChange={(value) => onChange({ subject: value ?? '' })}
              searchable
              clearable
            />
            <Select
              label={t('filters.pricing')}
              placeholder={t('common:all')}
              data={[
                { value: '', label: t('common:all') },
                { value: 'free', label: t('common:free') },
                { value: 'paid', label: t('common:paid') },
              ]}
              value={query.pricingType}
              onChange={(value) => onChange({ pricingType: value ?? '' })}
              className="sm:col-span-2 lg:col-span-1 xl:col-span-2"
            />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowUpDown className="h-4 w-4 text-primary" />
            {t('filters.display')}
          </div>
          <Select
            label={t('sort.label')}
            data={[
              { value: 'newest', label: t('sort.newest') },
              { value: 'popular', label: t('sort.popular') },
              { value: 'views', label: t('sort.views') },
            ]}
            value={query.sort}
            onChange={(value) => onChange({ sort: value ?? 'newest' })}
          />
          <Checkbox
            label={t('filters.featuredOnly')}
            checked={query.featured}
            onChange={(e) => onChange({ featured: e.currentTarget.checked })}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('filters.clear')}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default MarketplaceFiltersPanel;
