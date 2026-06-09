import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { Users } from 'lucide-react';
const EnrolledStudentsModal = ({
  opened,
  onClose,
  title,
  loadStudents,
}) => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opened || !loadStudents) return;
    setLoading(true);
    loadStudents()
      .then((data) => {
        setStudents(data?.students ?? []);
        setTotal(data?.total ?? data?.students?.length ?? 0);
      })
      .catch(() => {
        setStudents([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [opened, loadStudents]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title || 'Enrolled students'}
      size="md"
      centered
      classNames={{ content: 'glass-card !bg-card' }}
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        {loading ? 'Loading…' : `${total} student${total === 1 ? '' : 's'} enrolled`}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading enrollments…</p>
      ) : students.length ? (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {students.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
            >
              <p className="font-medium text-foreground">
                {s.firstName} {s.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{s.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
      )}
    </Modal>
  );
};

export default EnrolledStudentsModal;
