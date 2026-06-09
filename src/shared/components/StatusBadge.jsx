import { AdesiaBadge } from './AdesiaBadge';

const statusMap = {
  PENDING: 'draft',
  QUEUED: 'processing',
  PROCESSING: 'processing',
  COMPLETED: 'ready',
  FAILED: 'failed',
  ACTIVE: 'ready',
  SUSPENDED: 'due',
  INACTIVE: 'draft',
};

export const StatusBadge = ({ status }) => (
  <AdesiaBadge status={statusMap[status] || 'draft'}>{status || 'UNKNOWN'}</AdesiaBadge>
);

export default StatusBadge;
