import api from '../../../shared/api/axios.instance';
import { platformEndpoints as ep } from '../platform.endpoints';
import { unwrapData, unwrapPaginated } from '../../../shared/utils/formatters';

export const recordVisit = async (payload) =>
  unwrapData(await api.post(ep.visits, payload));

export const getPlatformStats = async (days = 30) =>
  unwrapData(await api.get(ep.stats, { params: { days } }));

export const listPlatformVisits = async (params = {}) =>
  unwrapPaginated(await api.get(ep.visits, { params }));

export const getPlatformTraffic = async (days = 30) =>
  unwrapData(await api.get(ep.traffic, { params: { days } }));

export const getPlatformHealth = async (hours = 24) =>
  unwrapData(await api.get(ep.health, { params: { hours } }));

export const runPlatformHealthCheck = async () =>
  unwrapData(await api.post(ep.healthCheck));

export const listPlatformUsers = async (params = {}) =>
  unwrapPaginated(await api.get(ep.users, { params }));

export const updatePlatformUser = async (id, payload) =>
  unwrapData(await api.patch(ep.user(id), payload));

export const listPlatformOrganizations = async (params = {}) =>
  unwrapPaginated(await api.get(ep.organizations, { params }));

export const upgradeOrganizationPlan = async (organizationId, plan) =>
  unwrapData(await api.patch(ep.upgradePlan(organizationId), { plan }));

export const listPlatformInvoices = async (params = {}) =>
  unwrapPaginated(await api.get(ep.invoices, { params }));

export const createPlatformInvoice = async (payload) =>
  unwrapData(await api.post(ep.invoices, payload));

export const updatePlatformInvoice = async (id, payload) =>
  unwrapData(await api.patch(ep.invoice(id), payload));

export const listPlatformEmailTemplates = async (params = {}) => {
  const data = unwrapData(await api.get(ep.emailTemplates, { params }));
  return data?.items ? data : { items: Array.isArray(data) ? data : [], pagination: {} };
};

export const createPlatformEmailTemplate = async (payload) =>
  unwrapData(await api.post(ep.emailTemplates, payload));

export const updatePlatformEmailTemplate = async (id, payload) =>
  unwrapData(await api.patch(ep.emailTemplate(id), payload));

export const deletePlatformEmailTemplate = async (id) =>
  unwrapData(await api.delete(ep.emailTemplate(id)));

export const previewPlatformEmail = async (payload) =>
  unwrapData(await api.post(ep.emailPreview, payload));

export const listPlatformEmailCampaigns = async (params = {}) => {
  const data = unwrapData(await api.get(ep.emailCampaigns, { params }));
  return data?.items ? data : { items: Array.isArray(data) ? data : [], pagination: {} };
};

export const createPlatformEmailCampaign = async (payload) =>
  unwrapData(await api.post(ep.emailCampaigns, payload));

export const updatePlatformEmailCampaign = async (id, payload) =>
  unwrapData(await api.patch(ep.emailCampaign(id), payload));

export const deletePlatformEmailCampaign = async (id) =>
  unwrapData(await api.delete(ep.emailCampaign(id)));

export const schedulePlatformEmailCampaign = async (id, scheduleAt) =>
  unwrapData(await api.post(ep.emailCampaignSchedule(id), { scheduleAt }));

export const sendPlatformEmailCampaign = async (id) =>
  unwrapData(await api.post(ep.emailCampaignSend(id)));

export const recoverStuckEmailCampaigns = async () =>
  unwrapData(await api.post(ep.emailCampaignRecoverStuck));

export const listPlatformEmailLogs = async (params = {}) =>
  unwrapData(await api.get(ep.emailLogs, { params }));

export const getPlatformAutomatedEmails = async () =>
  unwrapData(await api.get(ep.emailAutomated));

export const pauseAllAutomatedEmails = async (paused) =>
  unwrapData(await api.patch(ep.emailAutomatedPauseAll, { paused }));

export const pauseAutomatedEmailTemplate = async (key, paused) =>
  unwrapData(await api.patch(ep.emailAutomatedTemplatePause(key), { paused }));

export const sendAutomatedEmailTest = async (key, email) =>
  unwrapData(await api.post(ep.emailAutomatedTemplateTest(key), { email }));

export const getPlatformInvoiceStats = async () =>
  unwrapData(await api.get(ep.invoiceStats));

export const deletePlatformInvoice = async (id) =>
  unwrapData(await api.delete(ep.invoice(id)));

export const sendPlatformInvoice = async (id) =>
  unwrapData(await api.post(ep.invoiceSend(id)));

export const generatePlatformInvoicePaymentLink = async (id, provider) =>
  unwrapData(await api.post(ep.invoicePaymentLink(id), provider ? { provider } : {}));

export const getPlatformPaymentSettings = async () =>
  unwrapData(await api.get(ep.paymentSettings));

export const updatePlatformPaymentSettings = async (payload) =>
  unwrapData(await api.patch(ep.paymentSettings, payload));

export const previewPlatformUser = async (userId) =>
  unwrapData(await api.get(ep.previewUser(userId)));

export const previewPlatformOrganization = async (orgId) =>
  unwrapData(await api.get(ep.previewOrganization(orgId)));

export const listPlatformContent = async (params = {}) =>
  unwrapData(await api.get(ep.content, { params }));

