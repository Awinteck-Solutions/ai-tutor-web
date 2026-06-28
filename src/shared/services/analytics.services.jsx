import api from '../api/axios.instance';
import { BASEURL } from '../../constants/api.constant';
import { unwrapData } from '../utils/formatters';

const BASE = `${BASEURL}/analytics`;

export const generateStudentReport = async (params) =>
  unwrapData(await api.post(`${BASE}/students/analyse`, params));

/** @deprecated use generateStudentReport */
export const analyseStudent = generateStudentReport;

export const getStoredStudentReport = async (params) =>
  unwrapData(await api.get(`${BASE}/students/reports/stored`, { params }));

export const listStudentReports = async ({ studentId, organizationId }) =>
  unwrapData(await api.get(`${BASE}/students/reports`, {
    params: { studentId, organizationId },
  }));

export const getStudentAnalysisContext = async ({ studentId, organizationId }) =>
  unwrapData(await api.get(`${BASE}/students/analysis-context`, {
    params: { studentId, organizationId },
  }));

export const getBillingConfig = async () =>
  unwrapData(await api.get(`${BASEURL}/billing/config`));
