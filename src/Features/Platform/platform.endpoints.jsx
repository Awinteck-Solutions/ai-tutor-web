import { BASEURL } from '../../constants/api.constant';

const BASE = `${BASEURL}/platform`;

export const platformEndpoints = {
  stats: `${BASE}/stats`,
  visits: `${BASE}/visits`,
  traffic: `${BASE}/traffic`,
  health: `${BASE}/health`,
  healthCheck: `${BASE}/health/check`,
  users: `${BASE}/users`,
  user: (id) => `${BASE}/users/${id}`,
  organizations: `${BASE}/organizations`,
  upgradePlan: (organizationId) => `${BASE}/organizations/${organizationId}/plan`,
  invoices: `${BASE}/invoices`,
  invoice: (id) => `${BASE}/invoices/${id}`,
};
