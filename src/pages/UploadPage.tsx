import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, AlertTriangle, PartyPopper, Plus } from 'lucide-react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { PrimaryButton } from '@/components/ui/Button';
import { TagChip } from '@/components/ui/Chip';
import { uploadDetailsSchema, type UploadDetailsFormValues } from '@/lib/validation/uploadSchema';
import { fetchUploadSignature, cleanupOrphanedUpload } from '@/lib/api/upload';
import {
  uploadToCloudinary,
  buildVideoThumbnailUrl,
  readImageMetadata,
  readVideoMetadata,
} from '@/lib/api/cloudinaryUpload';
import { createMeme } from '@/lib/api/memes';
import type { ApiMediaType } from '@/lib/api/types';
import { usePostHog } from '@posthog/react';

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;
const MAX_VIDEO_SECONDS = 60;

type Stage = 'form' | 'uploading' | 'success' | 'error';
type MediaMetadata = { width?: number; height?: number; durationSec?: number };

export function UploadPage() {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<ApiMediaType | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MediaMetadata>({});

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [stage, setStage] = useState<Stage>('form');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Uploading…');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newMemeId, setNewMemeId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadDetailsFormValues>({ resolver: zodResolver(uploadDetailsSchema) });

  const onSelectFile = async (picked: File, type: ApiMediaType) => {
    setMediaError(null);
    try {
      if (type === 'image') {
        if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
          setMediaError(
            `Images must be under ${MAX_IMAGE_MB} MB. This file is ${(picked.size / 1024 / 1024).toFixed(1)} MB.`
          );
          return;
        }
        const { width, height } = await readImageMetadata(picked);
        setMetadata({ width, height });
      } else {
        if (picked.size > MAX_VIDEO_MB * 1024 * 1024) {
          setMediaError(
            `Videos must be under ${MAX_VIDEO_MB} MB. This file is ${(picked.size / 1024 / 1024).toFixed(1)} MB.`
          );
          return;
        }
        const { durationSec, width, height } = await readVideoMetadata(picked);
        if (durationSec > MAX_VIDEO_SECONDS) {
          setMediaError(`Videos must be ${MAX_VIDEO_SECONDS}s or shorter. This one is ${Math.round(durationSec)}s.`);
          return;
        }
        setMetadata({ width, height, durationSec: Math.round(durationSec) });
      }
      setFile(picked);
      setMediaType(type);
      setPreviewUrl(URL.createObjectURL(picked));
    } catch {
      setMediaError('Couldn\u2019t read that file. Try a different one.');
    }
  };

  const onClearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setMetadata({});
    setMediaError(null);
  };

  const addTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').replace(/\s+/g, '');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onSubmit = async (values: UploadDetailsFormValues) => {
    if (!file || !mediaType) {
      setMediaError('Choose a photo or video first.');
      return;
    }

    setStage('uploading');
    setUploadError(null);
    setProgress(0);

    try {
      setProgressLabel('Preparing upload…');
      const sig = await fetchUploadSignature(mediaType);

      setProgressLabel('Uploading…');
      const cloudinaryResult = await uploadToCloudinary(file, sig, (fraction) => {
        // Reserve the last slice of the bar for the metadata save below,
        // so it doesn't sit at 100% while still waiting on Neon.
        setProgress(fraction * 0.9);
      });

      setProgressLabel('Finishing up…');
      let meme: { id: string };
      try {
        meme = await createMeme({
          title: values.title,
          description: values.description || undefined,
          tags,
          mediaType,
          cloudinaryPublicId: sig.publicId,
          mediaUrl: cloudinaryResult.secureUrl,
          thumbnailUrl: mediaType === 'video' ? buildVideoThumbnailUrl(cloudinaryResult.secureUrl) : undefined,
          durationSec: mediaType === 'video' ? cloudinaryResult.durationSec ?? metadata.durationSec : undefined,
          width: cloudinaryResult.width ?? metadata.width,
          height: cloudinaryResult.height ?? metadata.height,
        });
      } catch (saveError) {
        // The file is already on Cloudinary at this point, but Neon never
        // got a row for it — clean up the orphan rather than leaving it
        // billed against storage with nothing pointing to it. Best-effort:
        // logged, not shown to the person (their real error takes priority).
        cleanupOrphanedUpload(sig.publicId, mediaType).catch((cleanupErr) => {
          console.error('Failed to clean up orphaned Cloudinary upload:', cleanupErr);
        });
        throw saveError;
      }

      setProgress(1);
      setNewMemeId(meme.id);
      setStage('success');
    } catch (e) {
      posthog?.capture('meme_upload_failed', {
        media_type: mediaType ?? undefined,
      });
      posthog?.captureException(e);
      setUploadError(e instanceof Error ? e.message : 'That meme didn\u2019t make it. Check your connection and try again.');
      setStage('error');
    }
  };

  if (stage === 'uploading') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center text-center">
        {previewUrl &&
          (mediaType === 'video' ? (
            <video src={previewUrl} className="mb-8 h-36 w-36 rounded-lg object-cover" muted />
          ) : (
            <img src={previewUrl} alt="" className="mb-8 h-36 w-36 rounded-lg object-cover" />
          ))}
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary">{progressLabel}</p>
            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">
              {Math.round(progress * 100)}%
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt-light dark:bg-surface-alt">
            <div className="h-2.5 rounded-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">Hang tight — don&apos;t close this tab while your meme drops.</p>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle size={32} className="text-danger" strokeWidth={1.75} />
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-text-primary-light dark:text-text-primary">
          Oops. That meme didn&apos;t make it.
        </h1>
        <p className="mb-8 text-sm leading-5 text-text-secondary-light dark:text-text-secondary">{uploadError}</p>
        <PrimaryButton onClick={handleSubmit(onSubmit)} className="mb-3 w-full">
          Try Again
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setStage('form')}
          className="py-3 text-sm font-semibold text-text-secondary-light dark:text-text-secondary"
        >
          Edit Details
        </button>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/15">
          <PartyPopper size={34} className="text-secondary" />
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-text-primary-light dark:text-text-primary">
          Your meme is live 🎉
        </h1>
        <p className="mb-8 text-sm text-text-secondary-light dark:text-text-secondary">
          It&apos;s out there now. Time to watch the downloads roll in.
        </p>
        <PrimaryButton onClick={() => navigate(`/meme/${newMemeId}`)} className="mb-3 w-full">
          View Meme
        </PrimaryButton>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="py-3 text-sm font-semibold text-text-secondary-light dark:text-text-secondary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-extrabold text-text-primary-light dark:text-text-primary">Drop a meme</h1>

      <FileDropzone file={file} previewUrl={previewUrl} mediaType={mediaType} onSelect={onSelectFile} onClear={onClearFile} />

      {mediaError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger bg-danger/10 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm leading-5 text-danger">{mediaError}</p>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface px-4 py-4">
        <p className="mb-2.5 text-sm font-bold text-text-primary-light dark:text-text-primary">Upload requirements</p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary">
          <span className="font-semibold text-text-primary-light dark:text-text-primary">Images</span> — Maximum{' '}
          {MAX_IMAGE_MB} MB
        </p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary">
          <span className="font-semibold text-text-primary-light dark:text-text-primary">Videos</span> — Maximum{' '}
          {MAX_VIDEO_MB} MB, up to {MAX_VIDEO_SECONDS}s
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
          Title
        </label>
        <input
          placeholder="Give your meme a title"
          maxLength={80}
          className="mb-1 w-full rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4 py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
          {...register('title')}
        />
        {errors.title && <p className="mb-2 text-xs text-danger">{errors.title.message}</p>}
        <div className="mb-5" />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
          Description
        </label>
        <textarea
          placeholder="Add some context…"
          maxLength={280}
          rows={3}
          className="mb-1 w-full resize-none rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4 py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
          {...register('description')}
        />
        {errors.description && <p className="mb-2 text-xs text-danger">{errors.description.message}</p>}
        <div className="mb-4" />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
          Tags
        </label>
        <div className="mb-1 flex items-center rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tags"
            className="w-full bg-transparent py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button type="button" onClick={addTag} aria-label="Add tag" className="shrink-0 text-primary">
            <Plus size={20} />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <TagChip key={t} label={t} onRemove={() => removeTag(t)} />
            ))}
          </div>
        )}

        <PrimaryButton type="submit" className="mt-6 w-full" disabled={!file}>
          Drop It 🚀
        </PrimaryButton>
      </form>
    </div>
  );
}