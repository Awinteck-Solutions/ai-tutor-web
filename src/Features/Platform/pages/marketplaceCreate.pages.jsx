import { useNavigate, useOutletContext } from 'react-router-dom';
import PlatformMarketplaceLessonBuilder from '../components/PlatformMarketplaceLessonBuilder';
import { platformMarketplaceLessonsPath } from '../platform.paths';

export default function PlatformMarketplaceCreatePage() {
  const navigate = useNavigate();
  const { organizationId, organizationName, workspace } = useOutletContext();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Create marketplace lesson</h2>
        <p className="text-sm text-muted-foreground">
          Follow three steps — curriculum, materials, then generate. Upload and generation settings open in focused dialogs.
        </p>
      </div>

      <PlatformMarketplaceLessonBuilder
        organizationId={organizationId}
        organizationName={organizationName}
        workspace={workspace}
        onGenerated={() => navigate(platformMarketplaceLessonsPath)}
      />
    </div>
  );
}
