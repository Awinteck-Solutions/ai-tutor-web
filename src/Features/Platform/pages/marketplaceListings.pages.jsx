import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, SegmentedControl, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Sparkles } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { PageLoader } from '../../../shared/components/PageLoader';
import PlatformMarketplaceEditModal from '../components/PlatformMarketplaceEditModal';
import PlatformMarketplacePreviewModal from '../components/PlatformMarketplacePreviewModal';
import PlatformMarketplaceAdminListingCard from '../components/PlatformMarketplaceAdminListingCard';
import { platformMarketplaceCreatePath } from '../platform.paths';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  archiveAdminMarketplaceListing,
  duplicateAdminMarketplaceListing,
  listAdminMarketplaceListings,
  resyncAdminMarketplaceListing,
  updateAdminMarketplaceListing,
} from '../../Marketplace/services/marketplace.services';

const STATUS_FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function PlatformMarketplaceListingsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [editListingId, setEditListingId] = useState(null);
  const [previewListingId, setPreviewListingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [previewOpen, { open: openPreview, close: closePreview }] = useDisclosure(false);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const listParams = useMemo(() => {
    const params = { limit: 50, search: search.trim() || undefined };
    if (statusFilter === 'active') params.status = undefined;
    else params.status = statusFilter;
    return params;
  }, [statusFilter, search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const listResult = await listAdminMarketplaceListings(listParams);
      setItems(listResult.items ?? []);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPendingGeneration = useMemo(
    () =>
      items.some(
        (row) =>
          row.sourceLessonId &&
          row.sourceGenerationStatus &&
          !['COMPLETED', 'FAILED'].includes(row.sourceGenerationStatus)
      ),
    [items]
  );

  useEffect(() => {
    if (!hasPendingGeneration) return undefined;
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [hasPendingGeneration, load]);

  const openEditModal = (row) => {
    setEditListingId(row.id);
    openEdit();
  };

  const openPreviewModal = (row) => {
    setPreviewListingId(row.id);
    openPreview();
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row);
    openConfirm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await archiveAdminMarketplaceListing(deleteTarget.id);
      notifications.show({ title: 'Deleted', message: 'Listing archived.', color: 'green' });
      closeConfirm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const publishListing = async (row) => {
    try {
      const updated = await updateAdminMarketplaceListing(row.id, { status: 'published' });
      setItems((current) =>
        current.map((item) => (item.id === row.id ? { ...item, ...updated, status: 'published' } : item))
      );
      notifications.show({ title: 'Published', message: 'Listing is live on the marketplace.', color: 'green' });
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const unpublishListing = async (row) => {
    try {
      const updated = await updateAdminMarketplaceListing(row.id, { status: 'draft' });
      setItems((current) =>
        current.map((item) => (item.id === row.id ? { ...item, ...updated, status: 'draft' } : item))
      );
      notifications.show({ title: 'Unpublished', message: 'Listing moved back to draft.', color: 'blue' });
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const resyncListing = async (row) => {
    try {
      await resyncAdminMarketplaceListing(row.id);
      notifications.show({ title: 'Synced', message: 'Content refreshed from source lesson.', color: 'green' });
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const duplicateListing = async (row) => {
    try {
      await duplicateAdminMarketplaceListing(row.id);
      notifications.show({ title: 'Duplicated', message: 'Draft copy created.', color: 'green' });
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const toggleFeatured = async (row) => {
    try {
      await updateAdminMarketplaceListing(row.id, { featured: !row.featured });
      await load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Catalog listings</h2>
          <p className="text-sm text-muted-foreground">
            Browse lessons the way students see them — preview content, flashcards, and quizzes before publishing.
          </p>
        </div>
        <GradientButton
          type="button"
          className="!px-3 !py-2"
          onClick={() => navigate(platformMarketplaceCreatePath)}
        >
          <Sparkles className="h-4 w-4" />
          Create lesson
        </GradientButton>
      </div>

      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          data={STATUS_FILTERS}
        />
        <TextInput
          placeholder="Search listings…"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          className="min-w-[220px] flex-1"
        />
      </GlassCard>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-muted-foreground">No marketplace listings yet.</p>
          <GradientButton
            type="button"
            className="mt-4 !px-3 !py-2"
            onClick={() => navigate(platformMarketplaceCreatePath)}
          >
            <Sparkles className="h-4 w-4" />
            Create your first lesson
          </GradientButton>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((listing) => (
            <PlatformMarketplaceAdminListingCard
              key={listing.id}
              listing={listing}
              onPreview={openPreviewModal}
              onEdit={openEditModal}
              onPublish={publishListing}
              onUnpublish={unpublishListing}
              onResync={resyncListing}
              onDuplicate={duplicateListing}
              onToggleFeatured={toggleFeatured}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      <PlatformMarketplacePreviewModal
        listingId={previewListingId}
        opened={previewOpen}
        onClose={() => {
          closePreview();
          setPreviewListingId(null);
        }}
      />

      <PlatformMarketplaceEditModal
        listingId={editListingId}
        opened={editOpen}
        onClose={() => {
          closeEdit();
          setEditListingId(null);
        }}
        onSaved={load}
      />

      <Modal opened={confirmOpen} onClose={closeConfirm} title="Delete listing?" centered>
        <p className="mb-4 text-sm text-muted-foreground">
          {deleteTarget
            ? `"${deleteTarget.title}" will be archived and removed from the public catalog. Existing imports remain in user libraries.`
            : 'This listing will be archived.'}
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={closeConfirm}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
