import { useEffect, useState } from 'react';
import { MultiSelect, NumberInput, Select, TextInput } from '@mantine/core';
import {
  getMaterials,
  getSubjectsList,
  getTopicsList,
} from '../../Features/Organization/services/organization.services';

export const STUDENT_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const defaultForm = {
  title: '',
  materialIds: [],
  order: 0,
  studentLevel: 'intermediate',
};

/**
 * Shared subject → topic → materials fields used by org and platform lesson generation.
 */
export default function GenerateLessonFromMaterialsFields({
  organizationId,
  value,
  onChange,
  onTopicIdChange,
  showDisplayOrder = true,
  disabled = false,
}) {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [topicId, setTopicId] = useState(null);
  const form = { ...defaultForm, ...value };

  useEffect(() => {
    if (!organizationId) {
      setSubjects([]);
      setTopics([]);
      setMaterials([]);
      setTopicId(null);
      return;
    }
    getSubjectsList(organizationId).then(setSubjects).catch(() => setSubjects([]));
    setTopics([]);
    setMaterials([]);
    setTopicId(null);
    onTopicIdChange?.(null);
  }, [organizationId]);

  const loadTopicsForSubject = async (subjectId) => {
    if (!organizationId || !subjectId) {
      setTopics([]);
      setMaterials([]);
      setTopicId(null);
      onTopicIdChange?.(null);
      return;
    }
    const data = await getTopicsList(organizationId, subjectId);
    setTopics(data);
    setTopicId(null);
    setMaterials([]);
    onTopicIdChange?.(null);
  };

  const loadMaterialsForTopic = async (tid) => {
    setTopicId(tid);
    onTopicIdChange?.(tid);
    if (!organizationId || !tid) {
      setMaterials([]);
      onChange({ ...form, materialIds: [] });
      return;
    }
    const data = await getMaterials(organizationId, { topicId: tid });
    setMaterials(data.filter((material) => material.processingStatus === 'COMPLETED'));
    onChange({ ...form, materialIds: [] });
  };

  const patchForm = (patch) => onChange({ ...form, ...patch });

  return (
    <div className="space-y-4">
      <Select
        label="Subject"
        placeholder="Select subject"
        searchable
        disabled={disabled || !organizationId}
        data={subjects.map((subject) => ({
          value: subject.id || subject._id,
          label: subject.name,
        }))}
        onChange={loadTopicsForSubject}
      />
      <Select
        label="Topic"
        placeholder="Select topic"
        searchable
        disabled={disabled || !organizationId}
        data={topics.map((topic) => ({
          value: topic.id || topic._id,
          label: topic.name,
        }))}
        value={topicId}
        onChange={loadMaterialsForTopic}
      />
      <TextInput
        label="Title (optional)"
        placeholder="Auto-generated if left blank"
        disabled={disabled}
        value={form.title}
        onChange={(event) => patchForm({ title: event.currentTarget.value })}
      />
      <Select
        label="Student level"
        description="Target depth and vocabulary for the generated lesson."
        disabled={disabled}
        data={STUDENT_LEVEL_OPTIONS}
        value={form.studentLevel}
        onChange={(nextValue) => patchForm({ studentLevel: nextValue ?? 'intermediate' })}
      />
      <MultiSelect
        label="Source materials"
        description="Select 1–10 completed materials"
        searchable
        disabled={disabled || !topicId}
        data={materials.map((material) => ({
          value: material.id || material._id,
          label: material.title || material.name,
        }))}
        value={form.materialIds}
        onChange={(materialIds) => patchForm({ materialIds })}
        maxValues={10}
      />
      {showDisplayOrder && (
        <NumberInput
          label="Display order"
          min={0}
          disabled={disabled}
          value={form.order}
          onChange={(nextValue) => patchForm({ order: Number(nextValue) || 0 })}
        />
      )}
    </div>
  );
}
