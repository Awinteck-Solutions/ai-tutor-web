import { BASEURL } from '../../constants/api.constant';

const BASE = `${BASEURL}/email`;

export const emailEndpoints = {
  preferences: `${BASE}/preferences`,
  unsubscribe: `${BASE}/unsubscribe`,
};
