import MarkdownContent from '../../../shared/components/MarkdownContent';

const CLAMP_CLASSES = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

/**
 * Renders marketplace copy (descriptions, lesson content, flashcards, etc.) as markdown.
 */
export default function MarketplaceMarkdown({
  content,
  className = '',
  clamp,
  variant = 'default',
}) {
  if (!content?.trim()) return null;

  const clampClass = clamp ? CLAMP_CLASSES[clamp] ?? '' : '';

  return (
    <div className={`min-w-0 ${clampClass} ${className}`.trim()}>
      <MarkdownContent content={content} variant={variant} />
    </div>
  );
}
