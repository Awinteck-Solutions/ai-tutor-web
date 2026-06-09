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
