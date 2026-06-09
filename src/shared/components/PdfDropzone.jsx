import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';

const isPdfFile = (candidate) => (
  candidate?.type === 'application/pdf' || candidate?.name?.toLowerCase().endsWith('.pdf')
);

export const PdfDropzone = ({ value, onChange, className = '' }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = (candidate) => {
    if (!candidate || !isPdfFile(candidate)) return;
    onChange?.(candidate);
  };

  const openPicker = () => inputRef.current?.click();

  const onDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsDragging(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const zoneClasses = [
    'group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
    isDragging
      ? 'border-primary bg-primary/10 shadow-glow-sm'
      : value
        ? 'border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/8'
        : 'border-border/70 bg-muted/20 hover:border-primary/45 hover:bg-primary/5',
    className,
  ].join(' ');

  return (
    <div
      role="button"
      tabIndex={0}
      className={zoneClasses}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => {
          pickFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {value ? (
        <>
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
            <FileText className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <p className="max-w-full truncate font-display text-sm font-semibold text-foreground">
            {value.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF ready · click or drop to replace
          </p>
        </>
      ) : (
        <>
          <div
            className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
              isDragging ? 'bg-primary/20 ring-2 ring-primary/30' : 'bg-muted/50 ring-1 ring-border/60 group-hover:bg-primary/10 group-hover:ring-primary/25'
            }`}
          >
            <Upload className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <p className="font-display text-sm font-semibold text-foreground">
            {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or <span className="font-medium text-primary">click to browse</span>
          </p>
        </>
      )}
    </div>
  );
};

export default PdfDropzone;
