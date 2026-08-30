import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { Search, Sun, Moon, Plus } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { PrimaryButton } from '../ui/Button';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
];

export function Header() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
      isActive
        ? 'text-primary'
        : 'text-text-secondary-light dark:text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border-light dark:border-border bg-bg-light/90 dark:bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="shrink-0 text-xl font-extrabold text-text-primary-light dark:text-text-primary">
          Meme<span className="text-primary">Drop</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isSignedIn && (
            <PrimaryButton onClick={() => navigate('/upload')} className="hidden sm:inline-flex" icon={<Plus size={16} />}>
              Drop a meme
            </PrimaryButton>
          )}

          <Link
            to="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt hover:opacity-80"
          >
            <Search size={18} className="text-text-primary-light dark:text-text-primary" />
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt hover:opacity-80"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-text-primary" />
            ) : (
              <Moon size={18} className="text-text-primary-light" />
            )}
          </button>

          {isSignedIn ? (
            <Link to="/profile" aria-label="Your profile">
              <Avatar src={user?.imageUrl} name={user?.username ?? 'you'} size="sm" />
            </Link>
          ) : (
            <PrimaryButton onClick={() => navigate('/sign-in')}>Sign In</PrimaryButton>
          )}
        </div>
      </div>

      {/* Compact nav row for narrow viewports, where the links above are hidden */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border-light dark:border-border px-4 py-2 md:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}