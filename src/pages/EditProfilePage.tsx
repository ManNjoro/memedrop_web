import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { ArrowLeft, Camera } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { useToastStore } from '@/store/useToastStore';
import { usePostHog } from '@posthog/react';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const showToast = useToastStore((s) => s.showToast);
  const posthog = usePostHog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isDirty =
    firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? '') || avatarPreview !== null;

  const onChangeAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      // Unlike the mobile app (which had to fetch() a local URI into a
      // Blob first), the browser's <input type="file"> already hands us a
      // real File — a Blob subclass — so it can be passed straight through.
      await user.setProfileImage({ file });
      showToast({ message: 'Profile photo updated', variant: 'success' });
    } catch {
      showToast({ message: 'Couldn\u2019t update your photo. Try again.', variant: 'error' });
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSave = async () => {
    if (!user || !isDirty) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      posthog?.capture('profile_updated', {
        changed_avatar: avatarPreview !== null,
        changed_name: firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? ''),
      });
      showToast({ message: 'Profile updated', variant: 'success' });
      navigate(-1);
    } catch {
      showToast({ message: 'Couldn\u2019t save your changes. Try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="mr-3">
          <ArrowLeft size={22} className="text-text-primary-light dark:text-text-primary" />
        </button>
        <h1 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary">Edit Profile</h1>
      </div>

      <div className="flex flex-col items-center py-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative"
          aria-label="Change profile photo"
        >
          <Avatar src={avatarPreview ?? user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-light dark:border-bg bg-primary">
            <Camera size={13} className="text-text-primary" />
          </span>
        </button>
        <p className="mt-3 text-xs text-text-muted">{uploadingAvatar ? 'Uploading…' : 'Click to change photo'}</p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onChangeAvatar} />
      </div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
        First name
      </label>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        maxLength={50}
        className="mb-5 w-full rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4 py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
      />

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
        Last name
      </label>
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
        maxLength={50}
        className="mb-5 w-full rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4 py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
      />

      {/* Same as Settings — username intentionally read-only here too. */}
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
        Username
      </label>
      <div className="mb-6 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface px-4 py-3.5 opacity-50">
        <p className="text-base text-text-primary-light dark:text-text-primary">@{user?.username}</p>
      </div>

      <PrimaryButton onClick={onSave} disabled={!isDirty} loading={saving} className="w-full">
        Save Changes
      </PrimaryButton>
    </div>
  );
}