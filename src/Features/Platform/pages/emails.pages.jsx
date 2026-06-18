import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Text } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createPlatformEmailCampaign,
  createPlatformEmailTemplate,
  deletePlatformEmailCampaign,
  deletePlatformEmailTemplate,
  listPlatformEmailCampaigns,
  listPlatformEmailLogs,
  listPlatformEmailTemplates,
  listPlatformOrganizations,
  previewPlatformEmail,
  recoverStuckEmailCampaigns,
  schedulePlatformEmailCampaign,
  sendPlatformEmailCampaign,
  updatePlatformEmailCampaign,
  updatePlatformEmailTemplate,
  getPlatformAutomatedEmails,
  pauseAllAutomatedEmails,
  pauseAutomatedEmailTemplate,
  sendAutomatedEmailTest,
} from '../services/platform.services';

const AUDIENCES = ['ALL', 'ROLE', 'ORGANIZATION', 'SEGMENT_INACTIVE'];
const ROLES = ['STUDENT', 'TEACHER', 'PARENT', 'SCHOOL_ADMIN'];
const CATEGORIES = ['REMINDERS', 'DIGEST', 'PRODUCT_UPDATES', 'MARKETING'];
const LOG_STATUSES = ['SENT', 'FAILED', 'SKIPPED', 'QUEUED'];
const CAMPAIGN_STATUSES = ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED'];
const VARIABLES = '{{firstName}}, {{email}}, {{organizationName}}, {{lessonTitle}}, {{currentStreak}}, {{pendingQuizCount}}';

const CAMPAIGN_STATUS_COLORS = {
  DRAFT: 'gray',
  SCHEDULED: 'blue',
  SENDING: 'orange',
  SENT: 'green',
  CANCELLED: 'red',
};

const LOG_STATUS_COLORS = {
  SENT: 'green',
  FAILED: 'red',
  SKIPPED: 'orange',
  QUEUED: 'blue',
};

const CATEGORY_COLORS = {
  REMINDERS: 'violet',
  DIGEST: 'cyan',
  PRODUCT_UPDATES: 'indigo',
  MARKETING: 'pink',
  TRANSACTIONAL: 'gray',
};

const StatusBadge = ({ status, colorMap = LOG_STATUS_COLORS }) => (
  <Badge color={colorMap[status] ?? 'gray'} variant="light" size="sm" radius="sm">
    {status}
  </Badge>
);

const TemplateStatusBadge = ({ isActive }) => (
  <Badge color={isActive ? 'green' : 'gray'} variant="light" size="sm">
    {isActive ? 'Active' : 'Inactive'}
  </Badge>
);

const emptyTemplateForm = {
  key: '',
  name: '',
  subject: '',
  bodyHtml: '',
  category: 'MARKETING',
};

const emptyCampaignForm = {
  name: '',
  templateId: '',
  audience: 'ALL',
  role: 'STUDENT',
  organizationId: '',
  scheduleAt: '',
};

const PaginationBar = ({ pagination, onPageChange }) => {
  if (!pagination?.pages || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
      <span>
        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          className="rounded-lg border border-border/60 px-3 py-1 disabled:opacity-40"
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= pagination.pages}
          className="rounded-lg border border-border/60 px-3 py-1 disabled:opacity-40"
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const EmailsPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') || 'templates');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [templatesPagination, setTemplatesPagination] = useState({});
  const [campaignsPagination, setCampaignsPagination] = useState({});
  const [logsPagination, setLogsPagination] = useState({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [templateFilters, setTemplateFilters] = useState({ search: '', category: '', page: 1 });
  const [campaignFilters, setCampaignFilters] = useState({ search: '', status: '', page: 1 });
  const [logFilters, setLogFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    status: '',
    templateKey: '',
    page: 1,
  }));
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [scheduleOpened, { open: openSchedule, close: closeSchedule }] = useDisclosure(false);
  const [scheduleCampaignId, setScheduleCampaignId] = useState(null);
  const [scheduleAt, setScheduleAt] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [automated, setAutomated] = useState(null);
  const [testEmail, setTestEmail] = useState('awinsamp@gmail.com');
  const [testSendingKey, setTestSendingKey] = useState(null);
  const [pauseAllLoading, setPauseAllLoading] = useState(false);

  const reloadAutomated = useCallback(async () => {
    const data = await getPlatformAutomatedEmails();
    setAutomated(data);
    if (data?.defaultTestEmail) setTestEmail(data.defaultTestEmail);
  }, []);

  const reloadTemplates = useCallback(async () => {
    const data = await listPlatformEmailTemplates({
      page: templateFilters.page,
      limit: 20,
      search: templateFilters.search || undefined,
      category: templateFilters.category || undefined,
    });
    setTemplates(data.items ?? []);
    setTemplatesPagination(data.pagination ?? {});
  }, [templateFilters]);

  const reloadCampaigns = useCallback(async () => {
    const data = await listPlatformEmailCampaigns({
      page: campaignFilters.page,
      limit: 20,
      search: campaignFilters.search || undefined,
      status: campaignFilters.status || undefined,
    });
    setCampaigns(data.items ?? []);
    setCampaignsPagination(data.pagination ?? {});
  }, [campaignFilters]);

  const reloadLogs = useCallback(async () => {
    const data = await listPlatformEmailLogs({
      page: logFilters.page,
      limit: 20,
      search: logFilters.search || undefined,
      status: logFilters.status || undefined,
      templateKey: logFilters.templateKey || undefined,
    });
    setLogs(data.items ?? []);
    setLogsPagination(data.pagination ?? {});
  }, [logFilters]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [orgsData] = await Promise.all([
        listPlatformOrganizations({ limit: 100 }),
      ]);
      setOrganizations(orgsData?.items ?? []);
      await Promise.all([reloadTemplates(), reloadCampaigns(), reloadLogs(), reloadAutomated()]);
    } catch (err) {
      notifications.show({ title: 'Emails', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, [reloadTemplates, reloadCampaigns, reloadLogs, reloadAutomated]);

  useEffect(() => {
    reload();
  }, [reload]);

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
  };

  const resetCampaignForm = () => {
    setEditingCampaignId(null);
    setCampaignForm(emptyCampaignForm);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplateId) {
        await updatePlatformEmailTemplate(editingTemplateId, {
          name: templateForm.name,
          subject: templateForm.subject,
          bodyHtml: templateForm.bodyHtml,
          category: templateForm.category,
        });
        notifications.show({ title: 'Templates', message: 'Template updated', color: 'green' });
      } else {
        await createPlatformEmailTemplate(templateForm);
        notifications.show({ title: 'Templates', message: 'Template created', color: 'green' });
      }
      resetTemplateForm();
      reloadTemplates();
    } catch (err) {
      notifications.show({ title: 'Templates', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplateId(template._id);
    setTemplateForm({
      key: template.key,
      name: template.name,
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      category: template.category,
    });
  };

  const confirmDeleteTemplate = (template) => {
    if (template.isSystem) {
      notifications.show({ title: 'Templates', message: 'System templates cannot be deleted', color: 'orange' });
      return;
    }
    modals.openConfirmModal({
      title: 'Delete template',
      centered: true,
      children: (
        <Text size="sm">
          Delete <strong>{template.name}</strong> ({template.key})? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete template', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deletePlatformEmailTemplate(template._id);
          notifications.show({ title: 'Templates', message: 'Template deleted', color: 'green' });
          if (editingTemplateId === template._id) resetTemplateForm();
          reloadTemplates();
        } catch (err) {
          notifications.show({ title: 'Templates', message: getErrorMessage(err), color: 'red' });
        }
      },
    });
  };

  const handlePreview = async (template) => {
    setPreviewLoading(true);
    setPreviewTitle(template.name);
    openPreview();
    try {
      const data = await previewPlatformEmail({ templateKey: template.key });
      setPreviewHtml(data.html ?? '');
    } catch (err) {
      closePreview();
      notifications.show({ title: 'Preview', message: getErrorMessage(err), color: 'red' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleToggleTemplate = async (template) => {
    try {
      await updatePlatformEmailTemplate(template._id, { isActive: !template.isActive });
      reloadTemplates();
    } catch (err) {
      notifications.show({ title: 'Templates', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (campaignForm.audience === 'ROLE' && !campaignForm.role) {
      notifications.show({ title: 'Campaigns', message: 'Select a role for ROLE audience', color: 'orange' });
      return;
    }
    if (campaignForm.audience === 'ORGANIZATION' && !campaignForm.organizationId) {
      notifications.show({ title: 'Campaigns', message: 'Select an organization for ORGANIZATION audience', color: 'orange' });
      return;
    }
    const payload = {
      name: campaignForm.name,
      templateId: campaignForm.templateId,
      audience: campaignForm.audience,
      role: campaignForm.audience === 'ROLE' ? campaignForm.role : undefined,
      organizationId: campaignForm.audience === 'ORGANIZATION' ? campaignForm.organizationId : undefined,
      scheduleAt: campaignForm.scheduleAt || undefined,
    };
    try {
      if (editingCampaignId) {
        await updatePlatformEmailCampaign(editingCampaignId, payload);
        notifications.show({ title: 'Campaigns', message: 'Campaign updated', color: 'green' });
      } else {
        await createPlatformEmailCampaign(payload);
        notifications.show({ title: 'Campaigns', message: 'Campaign created', color: 'green' });
      }
      resetCampaignForm();
      reloadCampaigns();
    } catch (err) {
      notifications.show({ title: 'Campaigns', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleEditCampaign = (campaign) => {
    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      notifications.show({ title: 'Campaigns', message: 'Sent campaigns cannot be edited', color: 'orange' });
      return;
    }
    setEditingCampaignId(campaign._id);
    setCampaignForm({
      name: campaign.name,
      templateId: campaign.templateId?._id ?? campaign.templateId ?? '',
      audience: campaign.audience,
      role: campaign.role ?? 'STUDENT',
      organizationId: campaign.organizationId?._id ?? campaign.organizationId ?? '',
      scheduleAt: campaign.scheduleAt ? campaign.scheduleAt.slice(0, 16) : '',
    });
  };

  const confirmDeleteCampaign = (campaign) => {
    if (campaign.status === 'SENT') {
      notifications.show({ title: 'Campaigns', message: 'Sent campaigns cannot be deleted', color: 'orange' });
      return;
    }
    if (campaign.status === 'SENDING') {
      notifications.show({
        title: 'Campaigns',
        message: 'Campaign is still sending. Restart the API to recover stuck campaigns, then try again.',
        color: 'orange',
      });
      return;
    }
    modals.openConfirmModal({
      title: 'Delete campaign',
      centered: true,
      children: (
        <Text size="sm">
          Delete campaign <strong>{campaign.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete campaign', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deletePlatformEmailCampaign(campaign._id);
          notifications.show({ title: 'Campaigns', message: 'Campaign deleted', color: 'green' });
          if (editingCampaignId === campaign._id) resetCampaignForm();
          reloadCampaigns();
        } catch (err) {
          notifications.show({ title: 'Campaigns', message: getErrorMessage(err), color: 'red' });
        }
      },
    });
  };

  const confirmSendCampaign = (campaign) => {
    modals.openConfirmModal({
      title: 'Send campaign now',
      centered: true,
      children: (
        <Text size="sm">
          Send <strong>{campaign.name}</strong> immediately to the selected audience? Recipients will be
          queued for delivery.
        </Text>
      ),
      labels: { confirm: 'Send now', cancel: 'Cancel' },
      confirmProps: { color: 'yellow' },
      onConfirm: () => handleSendCampaign(campaign._id),
    });
  };

  const openScheduleModal = (campaign) => {
    setScheduleCampaignId(campaign._id);
    setScheduleAt(campaign.scheduleAt ? new Date(campaign.scheduleAt) : null);
    openSchedule();
  };

  const submitSchedule = async () => {
    if (!scheduleCampaignId || !scheduleAt) {
      notifications.show({ title: 'Schedule', message: 'Pick a date and time', color: 'orange' });
      return;
    }
    setScheduling(true);
    try {
      await schedulePlatformEmailCampaign(scheduleCampaignId, scheduleAt.toISOString());
      notifications.show({ title: 'Campaigns', message: 'Campaign scheduled', color: 'green' });
      closeSchedule();
      reloadCampaigns();
    } catch (err) {
      notifications.show({ title: 'Campaigns', message: getErrorMessage(err), color: 'red' });
    } finally {
      setScheduling(false);
    }
  };
  const handleSendCampaign = async (id) => {
    try {
      await sendPlatformEmailCampaign(id);
      notifications.show({ title: 'Campaigns', message: 'Campaign queued for delivery', color: 'green' });
      reloadCampaigns();
      reloadLogs();
    } catch (err) {
      notifications.show({ title: 'Campaigns', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handlePauseAllAutomated = async (paused) => {
    setPauseAllLoading(true);
    try {
      await pauseAllAutomatedEmails(paused);
      notifications.show({
        title: 'Automated emails',
        message: paused ? 'All automated emails paused' : 'All automated emails resumed',
        color: 'green',
      });
      await reloadAutomated();
    } catch (err) {
      notifications.show({ title: 'Automated emails', message: getErrorMessage(err), color: 'red' });
    } finally {
      setPauseAllLoading(false);
    }
  };

  const handlePauseTemplate = async (key, paused) => {
    try {
      await pauseAutomatedEmailTemplate(key, paused);
      notifications.show({
        title: 'Automated emails',
        message: paused ? `${key} paused` : `${key} resumed`,
        color: 'green',
      });
      await reloadAutomated();
    } catch (err) {
      notifications.show({ title: 'Automated emails', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleSendAutomatedTest = async (key) => {
    if (!testEmail?.trim()) {
      notifications.show({ title: 'Test email', message: 'Enter a test email address', color: 'orange' });
      return;
    }
    setTestSendingKey(key);
    try {
      const result = await sendAutomatedEmailTest(key, testEmail.trim());
      notifications.show({
        title: 'Test email sent',
        message: `Sent to ${result.to ?? testEmail}`,
        color: 'green',
      });
      await reloadLogs();
    } catch (err) {
      notifications.show({ title: 'Test email', message: getErrorMessage(err), color: 'red' });
    } finally {
      setTestSendingKey(null);
    }
  };

  const filterInputClass =
    'rounded-xl border border-border/60 bg-background px-3 py-2 text-sm';

  return (
    <>
      <PageHeader
        title="Platform"
        gradientWord="emails"
        description="Manage email templates, campaigns, and delivery logs."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['templates', 'campaigns', 'automated', 'logs'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'
            }`}
          >
            {key === 'campaigns' ? 'Manual campaigns' : key === 'automated' ? 'Automated emails' : key}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {tab === 'templates' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-6">
                <h3 className="font-display text-sm font-semibold">
                  {editingTemplateId ? 'Edit template' : 'Create template'}
                </h3>
                <p className="text-xs text-muted-foreground">Variables: {VARIABLES}</p>
                <form className="space-y-3" onSubmit={handleSaveTemplate}>
                  {!editingTemplateId && (
                    <input
                      className={`w-full ${filterInputClass}`}
                      placeholder="KEY (e.g. CUSTOM_PROMO)"
                      value={templateForm.key}
                      onChange={(e) => setTemplateForm({ ...templateForm, key: e.target.value.toUpperCase() })}
                      required
                    />
                  )}
                  {editingTemplateId && (
                    <p className="text-xs text-muted-foreground">Key: {templateForm.key}</p>
                  )}
                  <input
                    className={`w-full ${filterInputClass}`}
                    placeholder="Name"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                  />
                  <input
                    className={`w-full ${filterInputClass}`}
                    placeholder="Subject"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    required
                  />
                  <select
                    className={`w-full ${filterInputClass}`}
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <textarea
                    className={`min-h-[120px] w-full ${filterInputClass}`}
                    placeholder="Body (HTML or plain paragraphs)"
                    value={templateForm.bodyHtml}
                    onChange={(e) => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                    required
                  />
                  <div className="flex gap-2">
                    <GradientButton type="submit" className="!px-4 !py-2">
                      {editingTemplateId ? 'Update template' : 'Create template'}
                    </GradientButton>
                    {editingTemplateId && (
                      <button type="button" className={filterInputClass} onClick={resetTemplateForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="flex flex-wrap gap-2 border-b border-border/40 p-4">
                  <input
                    type="search"
                    placeholder="Search templates"
                    className={filterInputClass}
                    value={templateFilters.search}
                    onChange={(e) => setTemplateFilters({ ...templateFilters, search: e.target.value, page: 1 })}
                  />
                  <select
                    className={filterInputClass}
                    value={templateFilters.category}
                    onChange={(e) => setTemplateFilters({ ...templateFilters, category: e.target.value, page: 1 })}
                  >
                    <option value="">All categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button type="button" className={filterInputClass} onClick={reloadTemplates}>
                    Apply
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map((t) => (
                        <tr key={t._id} className="border-t border-border/40">
                          <td className="px-4 py-3">
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.key}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge color={CATEGORY_COLORS[t.category] ?? 'gray'} variant="outline" size="sm">
                              {t.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <TemplateStatusBadge isActive={t.isActive} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" className="text-xs text-primary" onClick={() => handlePreview(t)}>
                                Preview
                              </button>
                              <button type="button" className="text-xs text-primary" onClick={() => handleEditTemplate(t)}>
                                Edit
                              </button>
                              <button type="button" className="text-xs text-primary" onClick={() => handleToggleTemplate(t)}>
                                {t.isActive ? 'Disable' : 'Enable'}
                              </button>
                              {!t.isSystem && (
                                <button type="button" className="text-xs text-red-500" onClick={() => confirmDeleteTemplate(t)}>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar
                  pagination={templatesPagination}
                  onPageChange={(page) => setTemplateFilters({ ...templateFilters, page })}
                />
              </GlassCard>
            </div>
          )}

          {tab === 'campaigns' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-6">
                <h3 className="font-display text-sm font-semibold">
                  {editingCampaignId ? 'Edit campaign' : 'New campaign'}
                </h3>
                <form className="space-y-3" onSubmit={handleSaveCampaign}>
                  <input
                    className={`w-full ${filterInputClass}`}
                    placeholder="Campaign name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    required
                  />
                  <select
                    className={`w-full ${filterInputClass}`}
                    value={campaignForm.templateId}
                    onChange={(e) => setCampaignForm({ ...campaignForm, templateId: e.target.value })}
                    required
                  >
                    <option value="">Select template</option>
                    {templates.filter((t) => t.isActive).map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <select
                    className={`w-full ${filterInputClass}`}
                    value={campaignForm.audience}
                    onChange={(e) => setCampaignForm({ ...campaignForm, audience: e.target.value })}
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  {campaignForm.audience === 'ROLE' && (
                    <select
                      className={`w-full ${filterInputClass}`}
                      value={campaignForm.role}
                      onChange={(e) => setCampaignForm({ ...campaignForm, role: e.target.value })}
                      required
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                  {campaignForm.audience === 'ORGANIZATION' && (
                    <select
                      className={`w-full ${filterInputClass}`}
                      value={campaignForm.organizationId}
                      onChange={(e) => setCampaignForm({ ...campaignForm, organizationId: e.target.value })}
                      required
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id ?? org._id} value={org.id ?? org._id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="datetime-local"
                    className={`w-full ${filterInputClass}`}
                    value={campaignForm.scheduleAt}
                    onChange={(e) => setCampaignForm({ ...campaignForm, scheduleAt: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <GradientButton type="submit" className="!px-4 !py-2">
                      {editingCampaignId ? 'Update campaign' : 'Create campaign'}
                    </GradientButton>
                    {editingCampaignId && (
                      <button type="button" className={filterInputClass} onClick={resetCampaignForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="flex flex-wrap gap-2 border-b border-border/40 p-4">
                  <input
                    type="search"
                    placeholder="Search campaigns"
                    className={filterInputClass}
                    value={campaignFilters.search}
                    onChange={(e) => setCampaignFilters({ ...campaignFilters, search: e.target.value, page: 1 })}
                  />
                  <select
                    className={filterInputClass}
                    value={campaignFilters.status}
                    onChange={(e) => setCampaignFilters({ ...campaignFilters, status: e.target.value, page: 1 })}
                  >
                    <option value="">All statuses</option>
                    {CAMPAIGN_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" className={filterInputClass} onClick={reloadCampaigns}>
                    Apply
                  </button>
                  {campaigns.some((c) => c.status === 'SENDING') && (
                    <button
                      type="button"
                      className={`${filterInputClass} text-orange-600`}
                      onClick={() => {
                        modals.openConfirmModal({
                          title: 'Recover stuck campaigns',
                          centered: true,
                          children: (
                            <Text size="sm">
                              Reset campaigns stuck in <strong>SENDING</strong> back to draft so you can retry?
                            </Text>
                          ),
                          labels: { confirm: 'Recover', cancel: 'Cancel' },
                          confirmProps: { color: 'orange' },
                          onConfirm: async () => {
                            try {
                              const result = await recoverStuckEmailCampaigns();
                              notifications.show({
                                title: 'Campaigns',
                                message: `Recovered ${result.recovered ?? 0} campaign(s)`,
                                color: 'green',
                              });
                              reloadCampaigns();
                            } catch (err) {
                              notifications.show({ title: 'Campaigns', message: getErrorMessage(err), color: 'red' });
                            }
                          },
                        });
                      }}
                    >
                      Recover stuck
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Campaign</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c._id} className="border-t border-border/40">
                          <td className="px-4 py-3">
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.templateId?.name ?? c.templateId?.key}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} colorMap={CAMPAIGN_STATUS_COLORS} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" className="text-xs text-primary" onClick={() => handleEditCampaign(c)}>
                                Edit
                              </button>
                              {c.status !== 'SENT' && c.status !== 'SENDING' && (
                                <button type="button" className="text-xs text-red-500" onClick={() => confirmDeleteCampaign(c)}>
                                  Delete
                                </button>
                              )}
                              {c.status !== 'SENT' && c.status !== 'SENDING' && (
                                <button type="button" className="text-xs text-primary" onClick={() => confirmSendCampaign(c)}>
                                  Send now
                                </button>
                              )}
                              {c.status !== 'SENT' && (
                                <button type="button" className="text-xs text-primary" onClick={() => openScheduleModal(c)}>
                                  Schedule
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar
                  pagination={campaignsPagination}
                  onPageChange={(page) => setCampaignFilters({ ...campaignFilters, page })}
                />
              </GlassCard>
            </div>
          )}

          {tab === 'automated' && automated && (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Worker</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {automated.enabled ? 'Enabled' : 'Disabled (env)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Sending</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {automated.running ? 'Active' : automated.globalPaused ? 'Paused (all)' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Schedule (UTC)</p>
                      <p className="mt-1 font-mono text-sm text-foreground">{automated.scheduleCron}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Sent (30 days)</p>
                      <p className="mt-1 font-semibold text-foreground">{automated.totals?.sentLast30Days ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {automated.running ? (
                      <button
                        type="button"
                        disabled={pauseAllLoading}
                        className="rounded-xl border border-orange-700/30 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-950 dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-200"
                        onClick={() => handlePauseAllAutomated(true)}
                      >
                        Pause all
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pauseAllLoading}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        onClick={() => handlePauseAllAutomated(false)}
                      >
                        Resume all
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border/40 pt-4">
                  <label className="block text-sm">
                    <span className="mb-1 block text-muted-foreground">Test recipient</span>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="awinsamp@gmail.com"
                      className={`min-w-[240px] ${filterInputClass}`}
                    />
                  </label>
                  <p className="pb-2 text-xs text-muted-foreground">
                    Used when you click Send test on a template below.
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="border-b border-border/40 px-4 py-3 font-display font-semibold">System email triggers</div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Template</th>
                      <th className="px-4 py-3">Trigger</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Sent (30d)</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(automated.templates ?? []).map((t) => (
                      <tr key={t.key} className="border-t border-border/40">
                        <td className="px-4 py-3">
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.key}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.trigger}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={t.isActive && !automated.globalPaused ? 'SENT' : 'SKIPPED'}
                            colorMap={{
                              SENT: 'green',
                              SKIPPED: 'gray',
                            }}
                          />
                          <span className="ml-2 text-xs text-muted-foreground">
                            {t.isActive && !automated.globalPaused ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{t.stats?.SENT ?? 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="text-xs text-primary"
                              onClick={() => handlePauseTemplate(t.key, t.isActive && !automated.globalPaused)}
                            >
                              {t.isActive && !automated.globalPaused ? 'Pause' : 'Resume'}
                            </button>
                            <button
                              type="button"
                              className="text-xs text-primary disabled:opacity-50"
                              disabled={testSendingKey === t.key}
                              onClick={() => handleSendAutomatedTest(t.key)}
                            >
                              {testSendingKey === t.key ? 'Sending…' : 'Send test'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="border-b border-border/40 px-4 py-3 font-display font-semibold">Recent automated deliveries</div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {(automated.recentLogs ?? []).map((log) => (
                      <tr key={log.id} className="border-t border-border/40">
                        <td className="px-4 py-3">{log.templateKey}</td>
                        <td className="px-4 py-3">{log.userEmail ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{log.sentAt ? formatDateTime(log.sentAt) : formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </div>
          )}

          {tab === 'logs' && (
            <GlassCard className="overflow-hidden p-0">
              <div className="flex flex-wrap gap-2 border-b border-border/40 p-4">
                <input
                  type="search"
                  placeholder="Search recipient"
                  className={filterInputClass}
                  value={logFilters.search}
                  onChange={(e) => setLogFilters({ ...logFilters, search: e.target.value, page: 1 })}
                />
                <input
                  type="search"
                  placeholder="Template key"
                  className={filterInputClass}
                  value={logFilters.templateKey}
                  onChange={(e) => setLogFilters({ ...logFilters, templateKey: e.target.value, page: 1 })}
                />
                <select
                  className={filterInputClass}
                  value={logFilters.status}
                  onChange={(e) => setLogFilters({ ...logFilters, status: e.target.value, page: 1 })}
                >
                  <option value="">All statuses</option>
                  {LOG_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button type="button" className={filterInputClass} onClick={reloadLogs}>
                  Apply
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Template</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Error</th>
                      <th className="px-4 py-3">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className="border-t border-border/40">
                        <td className="px-4 py-3">
                          <div>{log.userId?.email ?? log.userId}</div>
                        </td>
                        <td className="px-4 py-3">{log.templateKey}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate" title={log.subject}>{log.subject}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-xs text-red-500" title={log.errorMessage}>
                          {log.errorMessage ?? '—'}
                        </td>
                        <td className="px-4 py-3">{formatDateTime(log.sentAt ?? log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                pagination={logsPagination}
                onPageChange={(page) => setLogFilters({ ...logFilters, page })}
              />
            </GlassCard>
          )}
        </>
      )}

      <AdesiaModal
        opened={previewOpened}
        onClose={() => {
          closePreview();
          setPreviewHtml('');
        }}
        title={`Preview — ${previewTitle}`}
        size="xl"
      >
        {previewLoading ? (
          <PageLoader />
        ) : (
          <iframe title="Email preview" srcDoc={previewHtml} className="h-[520px] w-full rounded-xl border" />
        )}
      </AdesiaModal>

      <AdesiaModal
        opened={scheduleOpened}
        onClose={closeSchedule}
        title="Schedule campaign"
        submitLabel={scheduling ? 'Scheduling…' : 'Schedule send'}
        onSubmit={submitSchedule}
        submitting={scheduling}
        submitDisabled={!scheduleAt}
      >
        <Text size="sm" c="dimmed" mb="md">
          Choose when this campaign should be sent. Times are in your local timezone.
        </Text>
        <DateTimePicker
          value={scheduleAt}
          onChange={setScheduleAt}
          minDate={new Date()}
          placeholder="Pick date and time"
          className="w-full"
        />
      </AdesiaModal>
    </>
  );
};

export default EmailsPage;
