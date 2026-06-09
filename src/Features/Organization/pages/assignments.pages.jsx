import { useEffect, useState } from 'react';
import { Select, Tabs, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link2, Plus, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateShort, getErrorMessage } from '../../../shared/utils/formatters';
import {
  assignTeacher, enrollStudent, getAssignments, getMembers, getSubjectsList, linkParent,
} from '../services/organization.services';

const AssignmentsPage = () => {
  const { organizationId } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    teacherAssignments: [],
    studentEnrollments: [],
    parentLinks: [],
  });
  const [teacherForm, setTeacherForm] = useState({ teacherId: '', subjectId: '' });
  const [studentForm, setStudentForm] = useState({ studentId: '', subjectId: '' });
  const [parentForm, setParentForm] = useState({ parentId: '', studentId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('teachers');
  const [teacherOpen, { open: openTeacher, close: closeTeacher }] = useDisclosure(false);
  const [studentOpen, { open: openStudent, close: closeStudent }] = useDisclosure(false);
  const [parentOpen, { open: openParent, close: closeParent }] = useDisclosure(false);

  const load = () => {
    if (!organizationId) return;
    setLoading(true);
    Promise.all([
      getMembers(organizationId, { limit: 500 }),
      getSubjectsList(organizationId),
      getAssignments(organizationId),
    ])
      .then(([membersData, subjectsData, assignments]) => {
        const members = membersData?.items ?? [];
        setTeachers(members.filter((m) => m.role === 'TEACHER').map((m) => ({
          value: m.id || m._id,
          label: `${m.firstName} ${m.lastName}`,
        })));
        setStudents(members.filter((m) => m.role === 'STUDENT').map((m) => ({
          value: m.id || m._id,
          label: `${m.firstName} ${m.lastName}`,
        })));
        setParents(members.filter((m) => m.role === 'PARENT').map((m) => ({
          value: m.id || m._id,
          label: `${m.firstName} ${m.lastName}`,
        })));
        const subs = Array.isArray(subjectsData) ? subjectsData : [];
        setSubjects(subs.map((s) => ({ value: s.id || s._id, label: s.name })));
        setAssignmentData(assignments || { teacherAssignments: [], studentEnrollments: [], parentLinks: [] });
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [organizationId]);

  const submitTeacher = async () => {
    setSubmitting(true);
    try {
      await assignTeacher(organizationId, teacherForm);
      notifications.show({ title: 'Assigned', message: 'Teacher assigned to subject', color: 'green' });
      closeTeacher();
      setTeacherForm({ teacherId: '', subjectId: '' });
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitStudent = async () => {
    setSubmitting(true);
    try {
      await enrollStudent(organizationId, studentForm);
      notifications.show({ title: 'Enrolled', message: 'Student enrolled in subject', color: 'green' });
      closeStudent();
      setStudentForm({ studentId: '', subjectId: '' });
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitParent = async () => {
    setSubmitting(true);
    try {
      await linkParent(organizationId, parentForm);
      notifications.show({ title: 'Linked', message: 'Parent linked to student', color: 'green' });
      closeParent();
      setParentForm({ parentId: '', studentId: '' });
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const teacherColumns = [
    { key: 'subjectName', header: 'Subject' },
    { key: 'teacherName', header: 'Teacher' },
  ];

  const studentColumns = [
    { key: 'subjectName', header: 'Subject' },
    { key: 'studentName', header: 'Student' },
  ];

  const parentColumns = [
    { key: 'parentName', header: 'Parent' },
    { key: 'studentName', header: 'Student' },
    {
      key: 'linkedAt',
      header: 'Linked',
      render: (row) => formatDateShort(row.linkedAt || row.createdAt),
    },
  ];

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Assignments"
          gradientWord="Assignments"
          description="Manage teacher assignments, student enrollments, and parent links in one place."
        />
      )}

      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="teachers" leftSection={<UserCheck className="h-4 w-4" />}>
            Teachers ({assignmentData.teacherAssignments?.length ?? 0})
          </Tabs.Tab>
          <Tabs.Tab value="students" leftSection={<Users className="h-4 w-4" />}>
            Students ({assignmentData.studentEnrollments?.length ?? 0})
          </Tabs.Tab>
          <Tabs.Tab value="parents" leftSection={<Link2 className="h-4 w-4" />}>
            Parents ({assignmentData.parentLinks?.length ?? 0})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="teachers">
          <AdesiaDataTable
            title="Teacher → subject assignments"
            description="Teachers responsible for delivering each subject."
            data={assignmentData.teacherAssignments ?? []}
            columns={teacherColumns}
            loading={loading}
            searchable
            searchKeys={['subjectName', 'teacherName']}
            searchPlaceholder="Search assignments…"
            emptyMessage="No teacher assignments yet — add your first assignment."
            headerAction={(
              <GradientButton type="button" onClick={openTeacher} className="!px-3 !py-2">
                <Plus className="h-4 w-4" />
                Assign teacher
              </GradientButton>
            )}
          />
        </Tabs.Panel>

        <Tabs.Panel value="students">
          <AdesiaDataTable
            title="Student enrollments"
            description="Students enrolled in subjects across your organization."
            data={assignmentData.studentEnrollments ?? []}
            columns={studentColumns}
            loading={loading}
            searchable
            searchKeys={['subjectName', 'studentName']}
            searchPlaceholder="Search enrollments…"
            emptyMessage="No enrollments yet — enroll students in subjects."
            headerAction={(
              <GradientButton type="button" onClick={openStudent} className="!px-3 !py-2">
                <Plus className="h-4 w-4" />
                Enroll student
              </GradientButton>
            )}
          />
        </Tabs.Panel>

        <Tabs.Panel value="parents">
          <AdesiaDataTable
            title="Parent links"
            description="Parents connected to students for progress visibility."
            data={assignmentData.parentLinks ?? []}
            columns={parentColumns}
            loading={loading}
            searchable
            searchKeys={['parentName', 'studentName']}
            searchPlaceholder="Search parent links…"
            emptyMessage="No parent links yet — connect parents to students."
            headerAction={(
              <GradientButton type="button" onClick={openParent} className="!px-3 !py-2">
                <Plus className="h-4 w-4" />
                Link parent
              </GradientButton>
            )}
          />
        </Tabs.Panel>
      </Tabs>

      <AdesiaModal
        opened={teacherOpen}
        onClose={closeTeacher}
        title="Assign teacher to subject"
        submitLabel="Assign teacher"
        onSubmit={submitTeacher}
        submitting={submitting}
        submitDisabled={!teacherForm.teacherId || !teacherForm.subjectId}
      >
        <div className="space-y-4">
          <Select
            label="Teacher"
            placeholder="Select teacher"
            searchable
            data={teachers}
            value={teacherForm.teacherId}
            onChange={(v) => setTeacherForm({ ...teacherForm, teacherId: v })}
          />
          <Select
            label="Subject"
            placeholder="Select subject"
            searchable
            data={subjects}
            value={teacherForm.subjectId}
            onChange={(v) => setTeacherForm({ ...teacherForm, subjectId: v })}
          />
          {!teachers.length && (
            <Text size="xs" c="dimmed">Add teachers from the Members page first.</Text>
          )}
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={studentOpen}
        onClose={closeStudent}
        title="Enroll student in subject"
        submitLabel="Enroll student"
        onSubmit={submitStudent}
        submitting={submitting}
        submitDisabled={!studentForm.studentId || !studentForm.subjectId}
      >
        <div className="space-y-4">
          <Select
            label="Student"
            placeholder="Select student"
            searchable
            data={students}
            value={studentForm.studentId}
            onChange={(v) => setStudentForm({ ...studentForm, studentId: v })}
          />
          <Select
            label="Subject"
            placeholder="Select subject"
            searchable
            data={subjects}
            value={studentForm.subjectId}
            onChange={(v) => setStudentForm({ ...studentForm, subjectId: v })}
          />
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={parentOpen}
        onClose={closeParent}
        title="Link parent to student"
        submitLabel="Create link"
        onSubmit={submitParent}
        submitting={submitting}
        submitDisabled={!parentForm.parentId || !parentForm.studentId}
      >
        <div className="space-y-4">
          <Select
            label="Parent"
            placeholder="Select parent"
            searchable
            data={parents}
            value={parentForm.parentId}
            onChange={(v) => setParentForm({ ...parentForm, parentId: v })}
          />
          <Select
            label="Student"
            placeholder="Select student"
            searchable
            data={students}
            value={parentForm.studentId}
            onChange={(v) => setParentForm({ ...parentForm, studentId: v })}
          />
        </div>
      </AdesiaModal>
    </>
  );
};

export default AssignmentsPage;
