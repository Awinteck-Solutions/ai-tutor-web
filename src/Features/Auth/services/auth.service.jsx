import api, { tokenStorage } from '../../../shared/api/axios.instance';
import { authEndpoints } from '../auth.endpoints';
import { unwrapData } from '../../../shared/utils/formatters';
import { acceptInvite as acceptOrganizationInvite } from '../../Organization/services/organization.services';

export const register = async (payload) => {
  const { data } = await api.post(authEndpoints.REGISTER, payload);
  const result = data?.data ?? data;
  tokenStorage.setTokens(result.tokens);
  return result.user;
};

export const updateProfile = async (payload) =>
  unwrapData(await api.patch(authEndpoints.PROFILE, payload));

export const changePassword = async (payload) =>
  unwrapData(await api.patch(authEndpoints.CHANGE_PASSWORD, payload));

export const forgotPassword = async (email) =>
  unwrapData(await api.post(authEndpoints.FORGOT_PASSWORD, { email }));

export const resetPassword = async (payload) =>
  unwrapData(await api.post(authEndpoints.RESET_PASSWORD, payload));

export const acceptInvite = (payload) => acceptOrganizationInvite(payload);
