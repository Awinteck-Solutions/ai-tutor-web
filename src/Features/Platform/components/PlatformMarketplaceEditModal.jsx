import { useEffect, useState } from 'react';
import {
  Select, Switch, TextInput, Textarea, NumberInput, Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { MARKETPLACE_ACADEMIC_LEVELS } from '../../../shared/constants/marketplace.constants';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  getAdminMarketplaceListing,
  updateAdminMarketplaceListing,
} from '../../Marketplace/services/marketplace.services';

const STUDENT_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const emptyForm = {
  title: '',
  description: '',
  summary: '',
  subject: '',
  tags: [],
  academicLevel: 'primary',
  studentLevel: 'intermediate',
  content: '',
  pricingType: 'free',
  priceCents: 0,
  currency: 'USD',
  featured: false,
  status: 'draft',
};

function listingToForm(listing) {
  if (!listing) return emptyForm;
  return {
    title: listing.title ?? '',
    description: listing.description ?? '',
    summary: listing.summary ?? '',
    subject: listing.subject ?? '',
    tags: listing.tags ?? [],
    academicLevel: listing.academicLevel ?? 'primary',
    studentLevel: listing.studentLevel ?? 'intermediate',
    content: listing.content ?? '',
    pricingType: listing.pricingType ?? 'free',
    priceCents: listing.priceCents ?? 0,
    currency: listing.currency ?? 'USD',
    featured: Boolean(listing.featured),
    status: listing.status ?? 'draft',
  };
}

export default function PlatformMarketplaceEditModal({
  listingId,
  opened,
  onClose,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [listingMeta, setListingMeta] = useState(null);

  useEffect(() => {
    if (!opened || !listingId) return undefined;

    let cancelled = false;
    setLoading(true);
    getAdminMarketplaceListing(listingId)
      .then((listing) => {
        if (cancelled) return;
        setForm(listingToForm(listing));
        setListingMeta(listing);
      })
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [opened, listingId, onClose]);

  const patch = (updates) => setForm((current) => ({ ...current, ...updates }));

  const handleSave = async () => {
    if (!listingId || !form.title.trim() || !form.description.trim()) {
      notifications.show({
        title: 'Required fields',
        message: 'Title and description are required.',
        color: 'orange',
      });
      return;
    }
    if (!form.content.trim()) {
      notifications.show({
        title: 'Content required',
        message: 'Add lesson content or resync from the source lesson.',
        color: 'orange',
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateAdminMarketplaceListing(listingId, {
        ...form,
        tags: form.tags.filter(Boolean),
        priceCents: form.pricingType === 'paid' ? Number(form.priceCents) || 0 : 0,
      });
      notifications.show({ title: 'Saved', message: 'Listing updated.', color: 'green' });
      onSaved?.();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdesiaModal
      opened={opened}
      onClose={onClose}
      title="Edit marketplace listing"
      size="xl"
      submitLabel="Save changes"
      onSubmit={handleSave}
      submitting={submitting}
      submitDisabled={loading}
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading listing…</p>
      ) : (
        <Tabs defaultValue="details">
          <Tabs.List>
            <Tabs.Tab value="details">Details</Tabs.Tab>
            <Tabs.Tab value="content">Content</Tabs.Tab>
            <Tabs.Tab value="pricing">Pricing & visibility</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" className="space-y-4 pt-4">
            <TextInput
              label="Title"
              value={form.title}
              onChange={(event) => patch({ title: event.currentTarget.value })}
            />
            <Textarea
              label="Marketplace description"
              description="Supports markdown — shown on the catalog card and listing page."
              minRows={2}
              value={form.description}
              onChange={(event) => patch({ description: event.currentTarget.value })}
            />
            <Textarea
              label="Summary (optional)"
              description="Short hook shown on cards. Markdown supported."
              minRows={2}
              value={form.summary}
              onChange={(event) => patch({ summary: event.currentTarget.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Subject"
                value={form.subject}
                onChange={(event) => patch({ subject: event.currentTarget.value })}
              />
              <TextInput
                label="Tags"
                description="Comma-separated (e.g. algebra, exam prep)"
                value={(form.tags ?? []).join(', ')}
                onChange={(event) =>
                  patch({
                    tags: event.currentTarget.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Academic level"
                data={MARKETPLACE_ACADEMIC_LEVELS}
                value={form.academicLevel}
                onChange={(value) => patch({ academicLevel: value ?? 'primary' })}
              />
              <Select
                label="Student level"
                data={STUDENT_LEVEL_OPTIONS}
                value={form.studentLevel}
                onChange={(value) => patch({ studentLevel: value ?? 'intermediate' })}
              />
            </div>
            {listingMeta?.sourceLessonId && (
              <p className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Linked to generated lesson · generation status:{' '}
                {listingMeta.sourceGenerationStatus ?? 'unknown'} ·{' '}
                {listingMeta.flashcardCount ?? 0} flashcards ·{' '}
                {listingMeta.quizQuestionCount ?? 0} quiz questions
              </p>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="content" className="space-y-4 pt-4">
            <Textarea
              label="Lesson content (markdown)"
              description="Supports headings, lists, bold, and italic markdown."
              minRows={12}
              value={form.content}
              onChange={(event) => patch({ content: event.currentTarget.value })}
            />
          </Tabs.Panel>

          <Tabs.Panel value="pricing" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Pricing"
                data={[
                  { value: 'free', label: 'Free' },
                  { value: 'paid', label: 'Paid' },
                ]}
                value={form.pricingType}
                onChange={(value) => patch({ pricingType: value ?? 'free' })}
              />
              {form.pricingType === 'paid' && (
                <>
                  <NumberInput
                    label="Price (cents)"
                    value={form.priceCents}
                    onChange={(value) => patch({ priceCents: Number(value) || 0 })}
                    min={0}
                  />
                  <TextInput
                    label="Currency"
                    value={form.currency}
                    onChange={(event) =>
                      patch({ currency: event.currentTarget.value.toUpperCase() })
                    }
                    maxLength={3}
                  />
                </>
              )}
              <Select
                label="Status"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={form.status}
                onChange={(value) => patch({ status: value ?? 'draft' })}
              />
            </div>
            <Switch
              label="Featured on marketplace home"
              checked={form.featured}
              onChange={(event) => patch({ featured: event.currentTarget.checked })}
            />
            {listingMeta && (
              <p className="text-xs text-muted-foreground">
                Performance: {listingMeta.viewCount ?? 0} views ·{' '}
                {listingMeta.downloadCount ?? 0} imports · slug: {listingMeta.slug}
              </p>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </AdesiaModal>
  );
}
