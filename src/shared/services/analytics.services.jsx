import api from '../api/axios.instance';
import { BASEURL } from '../../constants/api.constant';
import { unwrapData } from '../utils/formatters';

const BASE = `${BASEURL}/analytics`;

export const analyseStudent = async (params) =>
  unwrapData(await api.post(`${BASE}/students/analyse`, params));

export const getBillingConfig = async () =>
  unwrapData(await api.get(`${BASEURL}/billing/config`));
