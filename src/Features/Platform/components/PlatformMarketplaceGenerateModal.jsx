import { useState } from 'react';
import {
  MultiSelect, NumberInput, Select, Switch, Textarea, TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { MARKETPLACE_ACADEMIC_LEVELS } from '../../../shared/constants/marketplace.constants';
import { STUDENT_LEVEL_OPTIONS } from '../../../shared/components/GenerateLessonFromMaterialsFields';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { generateAdminMarketplaceListing } from '../../Marketplace/services/marketplace.services';

const emptyLessonForm = {
  title: '',
  materialIds: [],
  order: 0,
  studentLevel: 'intermediate',
};

const emptyMarketplaceMeta = {
  description: '',
  academicLevel: 'primary',
  pricingType: 'free',
  priceCents: 0,
  featured: false,
};

export default function PlatformMarketplaceGenerateModal({
  opened,
  onClose,
  organizationId,
  topicId,
  readyMaterials,
  onGenerated,
}) {
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [marketplaceMeta, setMarketplaceMeta] = useState(emptyMarketplaceMeta);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setLessonForm(emptyLessonForm);
    setMarketplaceMeta(emptyMarketplaceMeta);
    onClose();
  };

  const handleGenerate = async () => {
    if (!topicId || !lessonForm.materialIds.length) {
      notifications.show({
        title: 'Select materials',
        message: 'Choose at least one completed material.',
        color: 'orange',
      });
      return;
    }
    if (!marketplaceMeta.description.trim()) {
      notifications.show({
        title: 'Description required',
        message: 'Add a marketplace description students will see on the catalog card.',
        color: 'orange',
      });
      return;
    }

    setSubmitting(true);
    try {
      await generateAdminMarketplaceListing({
        organizationId,
        topicId,
        materialIds: lessonForm.materialIds,
        title: lessonForm.title || undefined,
        order: lessonForm.order,
        studentLevel: lessonForm.studentLevel,
        description: marketplaceMeta.description.trim(),
        academicLevel: marketplaceMeta.academicLevel,
        pricingType: marketplaceMeta.pricingType,
        priceCents:
          marketplaceMeta.pricingType === 'paid'
            ? Number(marketplaceMeta.priceCents) || 0
            : 0,
        featured: marketplaceMeta.featured,
      });
      notifications.show({
        title: 'Generation started',
        message: 'Draft listing created — content syncs when AI generation completes.',
        color: 'green',
      });
      handleClose();
      onGenerated?.();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdesiaModal
      opened={opened}
      onClose={handleClose}
      title="Generate marketplace listing"
      size="lg"
      submitLabel={submitting ? 'Starting…' : 'Start generation'}
      onSubmit={handleGenerate}
      submitting={submitting}
      submitDisabled={!topicId || !lessonForm.materialIds.length || !marketplaceMeta.description.trim()}
    >
      <div className="space-y-4">
        <TextInput
          label="Lesson title"
          placeholder="Auto-generated if left blank"
          value={lessonForm.title}
          onChange={(event) => setLessonForm({ ...lessonForm, title: event.currentTarget.value })}
        />
        <Select
          label="Student level"
          description="Target depth and vocabulary for the generated lesson."
          data={STUDENT_LEVEL_OPTIONS}
          value={lessonForm.studentLevel}
          onChange={(value) => setLessonForm({ ...lessonForm, studentLevel: value ?? 'intermediate' })}
        />
        <MultiSelect
          label="Source materials"
          description="Select 1–10 completed materials"
          searchable
          disabled={!topicId}
          data={readyMaterials.map((material) => ({
            value: material.id || material._id,
            label: material.title || material.name,
          }))}
          value={lessonForm.materialIds}
          onChange={(materialIds) => setLessonForm({ ...lessonForm, materialIds })}
          maxValues={10}
        />
        <NumberInput
          label="Display order"
          min={0}
          value={lessonForm.order}
          onChange={(value) => setLessonForm({ ...lessonForm, order: Number(value) || 0 })}
        />
        <Textarea
          label="Marketplace description"
          description="Shown on the catalog card and listing page. Markdown supported."
          minRows={3}
          value={marketplaceMeta.description}
          onChange={(event) =>
            setMarketplaceMeta({ ...marketplaceMeta, description: event.currentTarget.value })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Academic level"
            data={MARKETPLACE_ACADEMIC_LEVELS}
            value={marketplaceMeta.academicLevel}
            onChange={(value) =>
              setMarketplaceMeta({ ...marketplaceMeta, academicLevel: value ?? 'primary' })
            }
          />
          <Select
            label="Pricing"
            data={[
              { value: 'free', label: 'Free' },
              { value: 'paid', label: 'Paid' },
            ]}
            value={marketplaceMeta.pricingType}
            onChange={(value) =>
              setMarketplaceMeta({ ...marketplaceMeta, pricingType: value ?? 'free' })
            }
          />
        </div>
        {marketplaceMeta.pricingType === 'paid' && (
          <NumberInput
            label="Price (cents)"
            value={marketplaceMeta.priceCents}
            onChange={(value) =>
              setMarketplaceMeta({ ...marketplaceMeta, priceCents: Number(value) || 0 })
            }
            min={0}
          />
        )}
        <Switch
          label="Feature on marketplace home"
          checked={marketplaceMeta.featured}
          onChange={(event) =>
            setMarketplaceMeta({ ...marketplaceMeta, featured: event.currentTarget.checked })
          }
        />
      </div>
    </AdesiaModal>
  );
}
