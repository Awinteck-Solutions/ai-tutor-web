import { useCallback, useEffect, useState } from 'react';
import { Badge, Select, Tabs, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { CalendarRange, Plus } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { useServerList } from '../../../shared/hooks/useServerList';
import {
  emptyPaginated,
  formatDateForApi,
  formatDateShort,
  getErrorMessage,
  parseApiDate,
} from '../../../shared/utils/formatters';
import {
  createTerm,
  createYear,
  getYears,
  getYearsList,
  getYearTerms,
} from '../services/organization.services';

const PAGE_SIZE = 8;

const AcademicYearsPage = () => {
  const { organizationId } = useAuth();
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedYearName, setSelectedYearName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('years');
  const [yearOpen, { open: openYear, close: closeYear }] = useDisclosure(false);
  const [termOpen, { open: openTerm, close: closeTerm }] = useDisclosure(false);
  const [yearForm, setYearForm] = useState({ name: '', startDate: null, endDate: null });
  const [termForm, setTermForm] = useState({ name: '', startDate: null, endDate: null });

  const refreshYearOptions = useCallback(async () => {
    if (!organizationId) return;
    try {
      const list = await getYearsList(organizationId);
      setYearOptions(Array.isArray(list) ? list : []);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  }, [organizationId]);

  useEffect(() => {
    refreshYearOptions();
  }, [refreshYearOptions]);

  const fetchYears = useCallback(async (params) => {
    if (!organizationId) return emptyPaginated(params.limit);
    try {
      return await getYears(organizationId, {
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return emptyPaginated(params.limit);
    }
  }, [organizationId]);

  const fetchTerms = useCallback(async (params) => {
    const yearId = params.academicYearId;
    if (!organizationId || !yearId) return emptyPaginated(params.limit);
    try {
      return await getYearTerms(organizationId, yearId, {
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return emptyPaginated(params.limit);
    }
  }, [organizationId]);

  const {
    items: years,
    loading,
    page: yearPage,
    setPage: setYearPage,
    search: yearSearch,
    setSearch: setYearSearch,
    meta: yearMeta,
    reload: reloadYears,
    rangeStart: yearRangeStart,
    rangeEnd: yearRangeEnd,
  } = useServerList(fetchYears, [organizationId], PAGE_SIZE);

  const {
    items: terms,
    loading: termsLoading,
    page: termPage,
    setPage: setTermPage,
    search: termSearch,
    setSearch: setTermSearch,
    meta: termMeta,
    reload: reloadTerms,
    setFilters: setTermFilters,
    rangeStart: termRangeStart,
    rangeEnd: termRangeEnd,
  } = useServerList(fetchTerms, [organizationId, selectedYearId], PAGE_SIZE);

  useEffect(() => {
    setTermFilters({ academicYearId: selectedYearId || undefined });
  }, [selectedYearId, setTermFilters]);

  const handleCreateYear = async () => {
    setSubmitting(true);
    try {
      await createYear(organizationId, {
        name: yearForm.name.trim(),
        startDate: formatDateForApi(yearForm.startDate),
        endDate: formatDateForApi(yearForm.endDate),
      });
      notifications.show({ title: 'Created', message: 'Academic year created', color: 'green' });
      closeYear();
      setYearForm({ name: '', startDate: null, endDate: null });
      reloadYears();
      refreshYearOptions();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTerm = async () => {
    if (!selectedYearId) return;
    setSubmitting(true);
    try {
      await createTerm(organizationId, {
        name: termForm.name.trim(),
        startDate: formatDateForApi(termForm.startDate),
        endDate: formatDateForApi(termForm.endDate),
        academicYearId: selectedYearId,
      });
      notifications.show({ title: 'Created', message: 'Term created', color: 'green' });
      closeTerm();
      setTermForm({ name: '', startDate: null, endDate: null });
      reloadTerms();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const openTermsForYear = (year) => {
    const id = year.id || year._id;
    setSelectedYearId(id);
    setSelectedYearName(year.name);
    setActiveTab('terms');
  };

  const selectedYear = yearOptions.find((y) => (y.id || y._id) === selectedYearId);

  if (!organizationId) return <EmptyOrgHint />;

  const yearColumns = [
    { key: 'name', header: 'Academic year', className: 'font-medium' },
    {
      key: 'startDate',
      header: 'Start',
      render: (row) => formatDateShort(row.startDate),
    },
    {
      key: 'endDate',
      header: 'End',
      render: (row) => formatDateShort(row.endDate),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          className="btn-outline !px-2 !py-1 text-xs"
          onClick={() => openTermsForYear(row)}
        >
          View terms
        </button>
      ),
    },
  ];

  const termColumns = [
    { key: 'name', header: 'Term', className: 'font-medium' },
    {
      key: 'startDate',
      header: 'Start',
      render: (row) => formatDateShort(row.startDate),
    },
    {
      key: 'endDate',
      header: 'End',
      render: (row) => formatDateShort(row.endDate),
    },
  ];

  return (
    <>
      {loading && !years.length ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Academic Calendar"
          gradientWord="Calendar"
          description="Structure your school year and terms for subjects, topics, and reporting."
          action={(
            <GradientButton type="button" onClick={openYear} className="!px-3 !py-2">
              <Plus className="h-4 w-4" />
              Add year
            </GradientButton>
          )}
        />
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="years" leftSection={<CalendarRange className="h-4 w-4" />}>
            Academic years
          </Tabs.Tab>
          <Tabs.Tab value="terms" leftSection={<CalendarRange className="h-4 w-4" />}>
            Terms
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="years">
          <AdesiaDataTable
            title="Academic years"
            description="Each year groups terms, subjects, and enrollment periods."
            data={years}
            columns={yearColumns}
            loading={loading}
            pageSize={PAGE_SIZE}
            serverPagination
            page={yearPage}
            totalPages={yearMeta.totalPages ?? 1}
            totalItems={yearMeta.total ?? 0}
            rangeStart={yearRangeStart}
            rangeEnd={yearRangeEnd}
            onPageChange={setYearPage}
            paginate={false}
            searchable
            search={yearSearch}
            onSearchChange={setYearSearch}
            searchPlaceholder="Search years…"
            emptyMessage="No academic years yet — create your first school year."
          />
        </Tabs.Panel>

        <Tabs.Panel value="terms">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <Select
              label="Academic year"
              placeholder="Select a year"
              className="min-w-[240px] flex-1 max-w-md"
              data={yearOptions.map((y) => ({ value: y.id || y._id, label: y.name }))}
              value={selectedYearId}
              onChange={(v) => {
                const year = yearOptions.find((y) => (y.id || y._id) === v);
                setSelectedYearId(v);
                setSelectedYearName(year?.name ?? '');
              }}
            />
            {selectedYearId && (
              <Badge variant="light" size="lg" className="mb-1">
                {selectedYearName || 'Selected year'}
              </Badge>
            )}
          </div>

          <AdesiaDataTable
            title="Terms"
            description={selectedYearId ? `Terms within ${selectedYearName}` : 'Select an academic year to manage its terms.'}
            data={selectedYearId ? terms : []}
            columns={termColumns}
            loading={termsLoading}
            pageSize={PAGE_SIZE}
            serverPagination
            page={termPage}
            totalPages={termMeta.totalPages ?? 1}
            totalItems={termMeta.total ?? 0}
            rangeStart={termRangeStart}
            rangeEnd={termRangeEnd}
            onPageChange={setTermPage}
            paginate={false}
            searchable
            search={termSearch}
            onSearchChange={setTermSearch}
            searchPlaceholder="Search terms…"
            emptyMessage={selectedYearId ? 'No terms for this year — add your first term.' : 'Select an academic year above.'}
            headerAction={selectedYearId ? (
              <GradientButton type="button" onClick={openTerm} className="!px-3 !py-2">
                <Plus className="h-4 w-4" />
                Add term
              </GradientButton>
            ) : null}
          />
        </Tabs.Panel>
      </Tabs>

      <AdesiaModal
        opened={yearOpen}
        onClose={closeYear}
        title="New academic year"
        submitLabel="Create year"
        onSubmit={handleCreateYear}
        submitting={submitting}
        submitDisabled={!yearForm.name.trim() || !yearForm.startDate || !yearForm.endDate}
      >
        <div className="space-y-4">
          <TextInput
            label="Year name"
            placeholder="e.g. 2025 / 2026"
            value={yearForm.name}
            onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
          />
          <DatePickerInput
            label="Start date"
            placeholder="Pick start date"
            value={yearForm.startDate}
            onChange={(v) => setYearForm({ ...yearForm, startDate: v })}
            maxDate={yearForm.endDate ?? undefined}
          />
          <DatePickerInput
            label="End date"
            placeholder="Pick end date"
            value={yearForm.endDate}
            onChange={(v) => setYearForm({ ...yearForm, endDate: v })}
            minDate={yearForm.startDate ?? undefined}
          />
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={termOpen}
        onClose={closeTerm}
        title={`New term — ${selectedYearName}`}
        submitLabel="Create term"
        onSubmit={handleCreateTerm}
        submitting={submitting}
        submitDisabled={!termForm.name.trim() || !termForm.startDate || !termForm.endDate}
      >
        <div className="space-y-4">
          <TextInput
            label="Term name"
            placeholder="e.g. Autumn term"
            value={termForm.name}
            onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
          />
          <DatePickerInput
            label="Start date"
            value={termForm.startDate}
            onChange={(v) => setTermForm({ ...termForm, startDate: v })}
            minDate={parseApiDate(selectedYear?.startDate)}
            maxDate={parseApiDate(selectedYear?.endDate)}
          />
          <DatePickerInput
            label="End date"
            value={termForm.endDate}
            onChange={(v) => setTermForm({ ...termForm, endDate: v })}
            minDate={termForm.startDate ?? undefined}
            maxDate={parseApiDate(selectedYear?.endDate)}
          />
        </div>
      </AdesiaModal>
    </>
  );
};

export default AcademicYearsPage;
