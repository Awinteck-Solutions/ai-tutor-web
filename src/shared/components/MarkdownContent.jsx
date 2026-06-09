const renderInline = (text) => {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : text;
};

const toneClasses = {
  default: {
    paragraph: 'text-sm leading-relaxed text-muted-foreground',
    list: 'list-disc space-y-1 pl-5 text-sm text-muted-foreground',
  },
  chat: {
    paragraph: 'text-sm leading-relaxed text-foreground',
    list: 'list-disc space-y-1 pl-5 text-sm text-foreground',
  },
};

const MarkdownContent = ({ content, className = '', variant = 'default' }) => {
  if (!content?.trim()) return null;

  const tone = toneClasses[variant] ?? toneClasses.default;

  const lines = content.split('\n');
  const blocks = [];
  let listItems = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={`p-${blocks.length}`} className={tone.paragraph}>
          {renderInline(paragraph.join(' '))}
        </p>,
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className={tone.list}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushParagraph();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushList();
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2];
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      const size = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base';
      blocks.push(
        <Tag key={`h-${blocks.length}`} className={`${size} font-semibold text-foreground`}>
          {renderInline(text)}
        </Tag>,
      );
      return;
    }

    const list = trimmed.match(/^[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      listItems.push(list[1]);
      return;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      listItems.push(ordered[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushList();
  flushParagraph();

  return (
    <div className={`prose-adesia space-y-3 ${className}`}>
      {blocks}
    </div>
  );
};

export default MarkdownContent;
