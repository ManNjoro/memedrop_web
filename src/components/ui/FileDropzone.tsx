import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Video as VideoIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiMediaType } from '@/lib/api/types';

type FileDropzoneProps = {
  file: File | null;
  previewUrl: string | null;
  mediaType: ApiMediaType | null;
  onSelect: (file: File, type: ApiMediaType) => void;
  onClear: () => void;
};

export function FileDropzone({ file, previewUrl, mediaType, onSelect, onClear }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;
    const type: ApiMediaType | null = picked.type.startsWith('video')
      ? 'video'
      : picked.type.startsWith('image')
        ? 'image'
        : null;
    if (!type) return;
    onSelect(picked, type);
  };

  if (file && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface">
        {mediaType === 'video' ? (
          <video src={previewUrl} className="max-h-80 w-full bg-black object-contain" controls />
        ) : (
          <img src={previewUrl} alt="" className="max-h-80 w-full object-contain" />
        )}
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove selected media"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80"
        >
          <X size={18} className="text-text-primary" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt'
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-light dark:bg-surface">
        <ImagePlus size={28} className="text-primary" />
      </div>
      <p className="mb-1 text-base font-bold text-text-primary-light dark:text-text-primary">Choose a meme</p>
      <p className="mb-6 text-sm text-text-muted">Drag and drop, or click to browse</p>
      <div className="flex gap-3">
        <span className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface px-5 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary">
          <ImagePlus size={16} /> Photo
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface px-5 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary">
          <VideoIcon size={16} /> Video
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}