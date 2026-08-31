import { useState, type ElementType, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';
import { User, AtSign, LogOut, Moon, Bell, Info, Shield, FileText, Flag, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useThemeStore } from '@/store/useThemeStore';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

type RowProps = {
  icon: ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  right?: ReactNode;
};

function SettingsRow({ icon: Icon, label, value, onClick, destructive, disabled, right }: RowProps) {
  const isInteractive = !!onClick && !disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        'flex w-full items-center px-4 py-3.5 text-left',
        isInteractive && 'hover:bg-surface-alt-light dark:hover:bg-surface-alt',
        disabled && 'cursor-default opacity-50'
      )}
    >
      <div
        className={cn(
          'mr-3 flex h-8 w-8 items-center justify-center rounded-full',
          destructive ? 'bg-danger/15' : 'bg-surface-alt-light dark:bg-surface-alt'
        )}
      >
        <Icon size={16} className={destructive ? 'text-danger' : 'text-text-secondary-light dark:text-text-secondary'} />
      </div>
      <span
        className={cn(
          'flex-1 text-sm font-medium',
          destructive ? 'text-danger' : 'text-text-primary-light dark:text-text-primary'
        )}
      >
        {label}
      </span>
      {right ? (
        right
      ) : isInteractive ? (
        <div className="flex items-center">
          {!!value && <span className="mr-1.5 text-xs text-text-muted">{value}</span>}
          <ChevronRight size={16} className="text-text-muted" />
        </div>
      ) : (
        !!value && <span className="text-xs text-text-muted">{value}</span>
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wide text-text-muted">{children}</p>;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const showToast = useToastStore((s) => s.showToast);
  const { theme, setTheme } = useThemeStore();

  const [notifications, setNotifications] = useState(true);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const onConfirmSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setSignOutOpen(false);
      navigate('/sign-in');
    } catch {
      showToast({ message: 'Couldn\u2019t sign out. Try again.', variant: 'error' });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-extrabold text-text-primary-light dark:text-text-primary">Settings</h1>

      <SectionLabel>Account</SectionLabel>
      <div className="divide-y divide-border-light dark:divide-border overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface">
        <SettingsRow
          icon={User}
          label="Edit Profile"
          value={user?.fullName || undefined}
          onClick={() => navigate('/settings/edit-profile')}
        />
        {/* Usernames aren't editable — see the mobile app's equivalent
            comment: changing one would break every /creator/[username]
            link and share URL pointing at this person's profile. */}
        <SettingsRow icon={AtSign} label="Username" value={user ? `@${user.username}` : undefined} disabled />
        <SettingsRow icon={LogOut} label="Sign Out" destructive onClick={() => setSignOutOpen(true)} />
      </div>

      <SectionLabel>Preferences</SectionLabel>
      <div className="divide-y divide-border-light dark:divide-border overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface">
        <SettingsRow
          icon={Moon}
          label="Dark Mode"
          right={<Switch checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Toggle dark mode" />}
        />
        <SettingsRow
          icon={Bell}
          label="Notifications"
          right={<Switch checked={notifications} onChange={setNotifications} label="Toggle notifications" />}
        />
      </div>

      {/* Storage section intentionally omitted — same reasoning as mobile:
          upload limits are fixed, developer-set constants, and there's no
          real storage-preference behavior to expose on Cloudinary's free
          tier yet. */}

      <SectionLabel>About</SectionLabel>
      <div className="divide-y divide-border-light dark:divide-border overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface">
        <SettingsRow icon={Info} label="About MemeDrop" onClick={() => {}} />
        <SettingsRow icon={Shield} label="Privacy Policy" onClick={() => {}} />
        <SettingsRow icon={FileText} label="Terms of Service" onClick={() => {}} />
        <SettingsRow icon={Flag} label="Report a Problem" onClick={() => {}} />
      </div>

      <p className="mt-8 text-center text-xs text-text-muted">MemeDrop v1.0.0</p>

      <ConfirmationModal
        open={signOutOpen}
        title="Sign out of MemeDrop?"
        message="You'll need to sign back in to upload or see your saved memes."
        confirmLabel="Sign Out"
        destructive
        loading={signingOut}
        onConfirm={onConfirmSignOut}
        onCancel={() => !signingOut && setSignOutOpen(false)}
      />
    </div>
  );
}