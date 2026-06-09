export const PageLoader = () => (
  <div className="flex justify-center py-24">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export const EmptyOrgHint = () => (
  <p className="text-sm text-muted-foreground">No organization selected.</p>
);

export default PageLoader;
