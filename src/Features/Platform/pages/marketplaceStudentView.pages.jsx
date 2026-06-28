import MarketplaceDetailPage from '../../Marketplace/pages/marketplaceDetail.pages';
import { platformMarketplaceLessonsPath } from '../platform.paths';

export default function PlatformMarketplaceStudentViewPage() {
  return (
    <MarketplaceDetailPage
      portalBase={platformMarketplaceLessonsPath}
      backTo={platformMarketplaceLessonsPath}
      readOnlyStudentPreview
    />
  );
}
