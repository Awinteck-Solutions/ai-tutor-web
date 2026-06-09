import { Skeleton } from '@mantine/core';
import { PageHeaderSkeleton, CardGridSkeleton } from '../../../shared/components/TableSkeleton';

export const StudentDashboardSkeleton = () => (
  <>
    <PageHeaderSkeleton />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <Skeleton height={10} width={80} radius="sm" mb={8} />
          <Skeleton height={28} width={60} radius="sm" />
        </div>
      ))}
    </div>
    <div className="mb-8 space-y-4">
      <Skeleton height={16} width={160} radius="sm" />
      <CardGridSkeleton count={2} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <Skeleton height={10} width={70} radius="sm" mb={8} />
          <Skeleton height={24} width={48} radius="sm" />
        </div>
      ))}
    </div>
  </>
);

export const StudentPracticeSkeleton = () => (
  <>
    <PageHeaderSkeleton />
    <div className="mb-6 grid gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 text-center">
          <Skeleton height={10} width={90} radius="sm" mx="auto" mb={8} />
          <Skeleton height={24} width={40} radius="sm" mx="auto" />
        </div>
      ))}
    </div>
    <Skeleton height={40} radius="md" mb={4} />
    <CardGridSkeleton count={6} />
  </>
);

export const StudentSettingsSkeleton = () => (
  <>
    <PageHeaderSkeleton />
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card space-y-4 p-6">
          <Skeleton height={16} width={100} radius="sm" />
          <Skeleton height={40} radius="md" />
          <Skeleton height={40} radius="md" />
          <Skeleton height={36} width={120} radius="md" />
        </div>
      ))}
    </div>
  </>
);

export const StudentLessonDetailSkeleton = () => (
  <>
    <PageHeaderSkeleton />
    <div className="mb-4 flex gap-2">
      <Skeleton height={24} width={100} radius="xl" />
      <Skeleton height={24} width={80} radius="xl" />
    </div>
    <Skeleton height={40} radius="md" mb={4} />
    <div className="glass-card p-6">
      <Skeleton height={14} radius="sm" mb={12} />
      <Skeleton height={14} radius="sm" mb={12} />
      <Skeleton height={14} width="80%" radius="sm" />
    </div>
  </>
);
