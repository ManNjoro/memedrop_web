import { cn } from '@/lib/utils';

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_MAP = { xs: 24, sm: 32, md: 44, lg: 72 };
const FONT_SIZE_MAP = { xs: 10, sm: 13, md: 18, lg: 29 };

export function Avatar({ src, name, size = 'sm', className }: AvatarProps) {
  const px = SIZE_MAP[size];
  const style = { width: px, height: px };

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} avatar`}
        style={style}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      style={{ ...style, fontSize: FONT_SIZE_MAP[size] }}
      className={cn('flex items-center justify-center rounded-full bg-primary font-bold text-text-primary', className)}
      aria-label={`${name} avatar`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}