import { useCallback, useEffect, useState } from 'react';
import {
  FileInput, Modal, Select, Tabs, Textarea, TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { FileUp, Plus, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { TableSkeleton } from '../../../shared/components/TableSkeleton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import StatusBadge from '../../../shared/components/StatusBadge';
import { useServerList } from '../../../shared/hooks/useServerList';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { titleFromFilename } from '../../../shared/utils/materialUpload';
import {
  deleteMaterial, getMaterialsPaginated, getSubjectsList, getTopicsList, reprocessMaterial,
  uploadPdf, uploadText, uploadYoutube,
} from '../services/organization.services';

const MaterialsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [uploadType, setUploadType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [textForm, setTextForm] = useState({ title: '', content: '' });
  const [youtubeForm, setYoutubeForm] = useState({ title: '', url: '' });
  const [view, setView] = useState('grid');

  const handlePdfFileChange = (f) => {
    setFile(f);
    if (f?.name) setPdfTitle(titleFromFilename(f.name));
  };

  const fetchMaterials = useCallback(async (params) => {
    if (!organizationId) return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    try {
      return await getMaterialsPaginated(organizationId, params);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [organizationId]);

  const {
    items: materials, loading, page, setPage, search, setSearch, meta, reload, rangeStart, rangeEnd,
  } = useServerList(fetchMaterials, [organizationId], 10);

  useEffect(() => {
    if (!organizationId) return;
    getSubjectsList(organizationId).then(setSubjects);
  }, [organizationId]);

  const loadTopicsForSubject = async (subjectId) => {
    const data = await getTopicsList(organizationId, subjectId);
    setTopics(data);
    setTopicId(null);
  };

  const handleUpload = async () => {
    if (!topicId) {
      notifications.show({ title: 'Error', message: 'Select a topic', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      if (uploadType === 'pdf' && file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('topicId', topicId);
        fd.append('organizationId', organizationId);
        fd.append('title', pdfTitle.trim() || titleFromFilename(file.name));
        await uploadPdf(fd);
      } else if (uploadType === 'text') {
        await uploadText({ ...textForm, topicId, organizationId });
      } else {
        await uploadYoutube({
          title: youtubeForm.title,
          youtubeUrl: youtubeForm.url,
          topicId,
          organizationId,
        });
      }
      notifications.show({ title: 'Queued', message: 'Material upload queued', color: 'green' });
      close();
      setFile(null);
      setPdfTitle('');
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReprocess = async (id) => {
    try {
      await reprocessMaterial(id, organizationId);
      notifications.show({ title: 'Queued', message: 'Reprocessing started', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMaterial(pendingDeleteId, organizationId);
      notifications.show({ title: 'Deleted', message: 'Material deleted', color: 'green' });
      closeConfirm();
      setPendingDeleteId(null);
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const columns = [
    { key: 'title', header: 'Title', className: 'font-medium', render: (m) => m.title || m.name },
    { key: 'type', header: 'Type', render: (m) => m.sourceType || m.type || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <StatusBadge status={m.processingStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Uploaded',
      render: (m) => formatDateTime(m.createdAt || m.uploadDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/materials/${m.id || m._id}/preview`}
            className="btn-outline !px-2 !py-1 text-xs no-underline"
          >
            <Volume2 className="h-3 w-3" />
            Preview
          </Link>
          <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleReprocess(m.id || m._id)}>
            Reprocess
          </button>
          <button
            type="button"
            className="btn-danger !px-2 !py-1 text-xs"
            onClick={() => {
              setPendingDeleteId(m.id || m._id);
              openConfirm();
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {loading && page === 1 ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Materials"
          gradientWord="Materials"
          description="Upload PDFs, text, and video content for AI lesson generation."
          action={(
            <GradientButton type="button" onClick={open} className="!px-3 !py-2">
              <Plus className="h-4 w-4" />
              Upload
            </GradientButton>
          )}
        />
      )}

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search materials…"
      />

      {view === 'grid' ? (
        <div className="data-table-wrap">
          <div className="border-b border-border/50 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-foreground">All materials</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {meta.total ?? 0} material{(meta.total ?? 0) === 1 ? '' : 's'} uploaded
            </p>
          </div>
          {loading ? (
            <div className="p-5"><TableSkeleton rows={4} columns={1} title={false} /></div>
          ) : materials.length ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((m) => (
                <GlassCard key={m.id || m._id} className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <FileUp className="h-5 w-5 shrink-0 text-primary" />
                    <StatusBadge status={m.processingStatus} />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{m.title || m.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{m.sourceType || m.type || '—'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(m.createdAt || m.uploadDate)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/admin/materials/${m.id || m._id}/preview`}
                      className="btn-outline !px-2 !py-1 text-xs no-underline"
                    >
                      <Volume2 className="h-3 w-3" />
                      Preview
                    </Link>
                    <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleReprocess(m.id || m._id)}>
                      Reprocess
                    </button>
                    <button
                      type="button"
                      className="btn-danger !px-2 !py-1 text-xs"
                      onClick={() => {
                        setPendingDeleteId(m.id || m._id);
                        openConfirm();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <p className="px-5 py-14 text-center text-muted-foreground">
              No materials yet — upload your first learning resource.
            </p>
          )}
          <DataListFooter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={meta.total ?? 0}
            page={page}
            totalPages={meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <AdesiaDataTable
          title="All materials"
          description={`${meta.total ?? 0} material${meta.total === 1 ? '' : 's'} uploaded`}
          data={materials}
          columns={columns}
          loading={loading}
          serverPagination
          page={page}
          totalPages={meta.totalPages ?? 1}
          totalItems={meta.total ?? 0}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          paginate={false}
          emptyMessage="No materials yet — upload your first learning resource."
        />
      )}

      <AdesiaModal
        opened={opened}
        onClose={close}
        title="Upload material"
        size="lg"
        submitLabel="Queue upload"
        onSubmit={handleUpload}
        submitting={submitting}
        submitDisabled={
          !topicId
          || (uploadType === 'pdf' && !file)
          || (uploadType === 'text' && (!textForm.title.trim() || !textForm.content.trim()))
          || (uploadType === 'youtube' && (!youtubeForm.title.trim() || !youtubeForm.url.trim()))
        }
      >
        <div className="space-y-4">
          <Select
            label="Subject"
            placeholder="Select subject"
            searchable
            data={subjects.map((s) => ({ value: s.id || s._id, label: s.name }))}
            onChange={(v) => loadTopicsForSubject(v)}
          />
          <Select
            label="Topic"
            placeholder="Select topic"
            searchable
            data={topics.map((t) => ({ value: t.id || t._id, label: t.name }))}
            value={topicId}
            onChange={setTopicId}
          />
          <Tabs value={uploadType} onChange={setUploadType}>
            <Tabs.List className="mb-2">
              <Tabs.Tab value="pdf" leftSection={<FileUp className="h-3.5 w-3.5" />}>PDF</Tabs.Tab>
              <Tabs.Tab value="text">Text</Tabs.Tab>
              <Tabs.Tab value="youtube">YouTube</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="pdf" className="space-y-3 pt-2">
              <FileInput
                label="PDF file"
                accept="application/pdf"
                value={file}
                onChange={handlePdfFileChange}
              />
              <TextInput
                label="Title"
                description="Defaults to the file name — edit if needed"
                placeholder="e.g. Financial success tips"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
              />
            </Tabs.Panel>
            <Tabs.Panel value="text" className="space-y-3 pt-2">
              <TextInput label="Title" value={textForm.title} onChange={(e) => setTextForm({ ...textForm, title: e.target.value })} />
              <Textarea label="Content" minRows={4} value={textForm.content} onChange={(e) => setTextForm({ ...textForm, content: e.target.value })} />
            </Tabs.Panel>
            <Tabs.Panel value="youtube" className="space-y-3 pt-2">
              <TextInput label="Title" value={youtubeForm.title} onChange={(e) => setYoutubeForm({ ...youtubeForm, title: e.target.value })} />
              <TextInput label="YouTube URL" value={youtubeForm.url} onChange={(e) => setYoutubeForm({ ...youtubeForm, url: e.target.value })} />
            </Tabs.Panel>
          </Tabs>
        </div>
      </AdesiaModal>

      <Modal opened={confirmOpen} onClose={closeConfirm} title="Delete material?" centered>
        <p className="mb-4 text-sm text-muted-foreground">This will permanently remove the material and its processed chunks.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={closeConfirm}>Cancel</button>
          <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </>
  );
};

export default MaterialsPage;
