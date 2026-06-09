import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import ChatExperience from '../components/ChatExperience';

const StudentChatPage = () => {
  const { organizationId } = useAuth();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId') ?? undefined;

  const context = useMemo(
    () => (lessonId ? { lessonId } : {}),
    [lessonId],
  );

  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="AI Tutor"
        gradientWord="Tutor"
        description="Chat with your AI study assistant. Conversations are saved and searchable."
      />
      <ChatExperience context={context} fullPage />
    </>
  );
};

export default StudentChatPage;
