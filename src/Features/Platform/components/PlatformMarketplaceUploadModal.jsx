import { useState } from 'react';
import {
  FileInput, Tabs, Textarea, TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FileUp } from 'lucide-react';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { titleFromFilename } from '../../../shared/utils/materialUpload';
import { uploadPdf, uploadText, uploadYoutube } from '../../Organization/services/organization.services';

export default function PlatformMarketplaceUploadModal({
  opened,
  onClose,
  organizationId,
  topicId,
  onUploaded,
}) {
  const [uploadType, setUploadType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [textForm, setTextForm] = useState({ title: '', content: '' });
  const [youtubeForm, setYoutubeForm] = useState({ title: '', url: '' });
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setUploadType('pdf');
    setFile(null);
    setPdfTitle('');
    setTextForm({ title: '', content: '' });
    setYoutubeForm({ title: '', url: '' });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePdfFileChange = (nextFile) => {
    setFile(nextFile);
    if (nextFile?.name) setPdfTitle(titleFromFilename(nextFile.name));
  };

  const handleUpload = async () => {
    if (!organizationId || !topicId) {
      notifications.show({
        title: 'Select a topic',
        message: 'Choose subject and topic on the create page first.',
        color: 'orange',
      });
      return;
    }

    setUploading(true);
    try {
      if (uploadType === 'pdf') {
        if (!file) {
          notifications.show({ title: 'PDF required', message: 'Choose a PDF file to upload.', color: 'orange' });
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topicId', topicId);
        formData.append('organizationId', organizationId);
        formData.append('title', pdfTitle.trim() || titleFromFilename(file.name));
        await uploadPdf(formData);
      } else if (uploadType === 'text') {
        if (!textForm.title.trim() || !textForm.content.trim()) {
          notifications.show({ title: 'Missing fields', message: 'Add a title and content.', color: 'orange' });
          return;
        }
        await uploadText({ ...textForm, topicId, organizationId });
      } else {
        if (!youtubeForm.title.trim() || !youtubeForm.url.trim()) {
          notifications.show({ title: 'Missing fields', message: 'Add a title and YouTube URL.', color: 'orange' });
          return;
        }
        await uploadYoutube({
          title: youtubeForm.title,
          youtubeUrl: youtubeForm.url,
          topicId,
          organizationId,
        });
      }

      notifications.show({ title: 'Queued', message: 'Material upload started.', color: 'green' });
      reset();
      onUploaded?.();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Upload failed', message: getErrorMessage(err), color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdesiaModal
      opened={opened}
      onClose={handleClose}
      title="Upload source material"
      size="lg"
      submitLabel={uploading ? 'Uploading…' : 'Queue upload'}
      onSubmit={handleUpload}
      submitting={uploading}
      submitDisabled={!topicId}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Add PDF, text, or YouTube content. Processing usually takes a minute before you can generate a lesson.
      </p>
      <Tabs value={uploadType} onChange={setUploadType}>
        <Tabs.List className="mb-4">
          <Tabs.Tab value="pdf" leftSection={<FileUp className="h-3.5 w-3.5" />}>PDF</Tabs.Tab>
          <Tabs.Tab value="text">Text</Tabs.Tab>
          <Tabs.Tab value="youtube">YouTube</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="pdf" className="space-y-3">
          <FileInput label="PDF file" accept="application/pdf" value={file} onChange={handlePdfFileChange} />
          <TextInput
            label="Title"
            placeholder="Defaults to file name"
            value={pdfTitle}
            onChange={(event) => setPdfTitle(event.currentTarget.value)}
          />
        </Tabs.Panel>
        <Tabs.Panel value="text" className="space-y-3">
          <TextInput
            label="Title"
            value={textForm.title}
            onChange={(event) => setTextForm({ ...textForm, title: event.currentTarget.value })}
          />
          <Textarea
            label="Content"
            minRows={5}
            value={textForm.content}
            onChange={(event) => setTextForm({ ...textForm, content: event.currentTarget.value })}
          />
        </Tabs.Panel>
        <Tabs.Panel value="youtube" className="space-y-3">
          <TextInput
            label="Title"
            value={youtubeForm.title}
            onChange={(event) => setYoutubeForm({ ...youtubeForm, title: event.currentTarget.value })}
          />
          <TextInput
            label="YouTube URL"
            value={youtubeForm.url}
            onChange={(event) => setYoutubeForm({ ...youtubeForm, url: event.currentTarget.value })}
          />
        </Tabs.Panel>
      </Tabs>
    </AdesiaModal>
  );
}
