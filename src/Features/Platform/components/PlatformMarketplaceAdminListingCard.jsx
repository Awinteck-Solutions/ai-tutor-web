import {
  BookOpen, ClipboardList, Copy, ExternalLink, Eye, Layers, Pencil, RefreshCw, Sparkles, Trash2, Undo2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import StatusBadge from '../../../shared/components/StatusBadge';
import { GradientButton } from '../../../shared/components/GradientButton';
import MarketplaceMarkdown from '../../Marketplace/components/MarketplaceMarkdown';
import { platformMarketplaceStudentViewPath } from '../platform.paths';

const STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

function listingStatusBadge(status) {
  if (status === 'published') return { badge: 'active', label: STATUS_LABELS.published };
  if (status === 'archived') return { badge: 'failed', label: STATUS_LABELS.archived };
  return { badge: 'draft', label: STATUS_LABELS.draft };
}

export default function PlatformMarketplaceAdminListingCard({
  listing,
  onPreview,
  onEdit,
  onPublish,
  onUnpublish,
  onResync,
  onDuplicate,
  onToggleFeatured,
  onDelete,
}) {
  const isPublished = listing.status === 'published';
  const statusMeta = listingStatusBadge(listing.status);
  const canPublish =
    !isPublished &&
    listing.status !== 'archived' &&
    (!listing.sourceLessonId || listing.sourceGenerationStatus === 'COMPLETED');

  return (
    <GlassCard
      className={`flex h-full flex-col gap-4 p-4 sm:p-5 ${
        isPublished ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <AdesiaBadge status={statusMeta.badge}>{statusMeta.label}</AdesiaBadge>
          {listing.featured && <AdesiaBadge status="active">Featured</AdesiaBadge>}
          <AdesiaBadge status={listing.pricingType === 'free' ? 'active' : 'pending'}>
            {listing.formattedPrice}
          </AdesiaBadge>
        </div>
        <AdesiaBadge status="ready" className="shrink-0">
          {listing.academicLevelLabel}
        </AdesiaBadge>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display line-clamp-2 text-base font-semibold text-foreground sm:text-lg">
            {listing.title}
          </h3>
          {listing.subject && (
            <p className="mt-0.5 text-xs font-medium text-primary/80">{listing.subject}</p>
          )}
        </div>
      </div>

      <MarketplaceMarkdown
        content={listing.description}
        clamp={3}
        className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground"
      />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
          <Layers className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-sm font-semibold">{listing.flashcardCount ?? 0}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Flashcards</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
          <ClipboardList className="mx-auto h-4 w-4 text-blue-500" />
          <p className="mt-1 text-sm font-semibold">{listing.quizQuestionCount ?? 0}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Quiz</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
          <Eye className="mx-auto h-4 w-4 text-emerald-500" />
          <p className="mt-1 text-sm font-semibold">{listing.downloadCount ?? 0}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Imports</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
        {listing.sourceLessonId ? (
          <StatusBadge status={listing.sourceGenerationStatus ?? 'PENDING'} />
        ) : (
          <span>Manual listing</span>
        )}
        <span>{listing.viewCount ?? 0} views</span>
      </div>

      {(canPublish || isPublished) && (
        <div className="border-t border-border/40 pt-3 space-y-2">
          {canPublish && (
            <GradientButton
              type="button"
              className="w-full !px-3 !py-2"
              onClick={() => onPublish(listing)}
            >
              <Sparkles className="h-4 w-4" />
              Publish to marketplace
            </GradientButton>
          )}
          {isPublished && (
            <>
              <Link
                to={platformMarketplaceStudentViewPath(listing.slug ?? listing.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
              >
                <ExternalLink className="h-4 w-4" />
                Student catalog view
              </Link>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground transition hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-foreground"
                onClick={() => onUnpublish(listing)}
              >
                <Undo2 className="h-4 w-4" />
                Unpublish (move to draft)
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/40 pt-3">
        <ActionButton icon={Eye} label="Preview" onClick={() => onPreview(listing)} primary />
        <ActionButton icon={Pencil} label="Edit" onClick={() => onEdit(listing)} />
        {listing.sourceLessonId && (
          <ActionButton icon={RefreshCw} label="Resync" onClick={() => onResync(listing)} />
        )}
        <ActionButton icon={Copy} label="Duplicate" onClick={() => onDuplicate(listing)} />
        <ActionButton
          label={listing.featured ? 'Unfeature' : 'Feature'}
          onClick={() => onToggleFeatured(listing)}
        />
        <ActionButton icon={Trash2} label="Delete" onClick={() => onDelete(listing)} danger />
      </div>
    </GlassCard>
  );
}

function ActionButton({ icon: Icon, label, onClick, primary, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs hover:underline ${
        danger ? 'text-red-500' : primary ? 'text-primary' : 'text-primary'
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
