import api from '../../../shared/api/axios.instance';
import { emailEndpoints as ep } from '../email.endpoints';
import { unwrapData } from '../../../shared/utils/formatters';

export const getEmailPreferences = async () =>
  unwrapData(await api.get(ep.preferences));

export const updateEmailPreferences = async (payload) =>
  unwrapData(await api.patch(ep.preferences, payload));

export const getUnsubscribePreferences = async (token) =>
  unwrapData(await api.get(ep.unsubscribe, { params: { token } }));

export const postUnsubscribePreferences = async (payload) =>
  unwrapData(await api.post(ep.unsubscribe, payload));
