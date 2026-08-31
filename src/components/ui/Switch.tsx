type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-border-light dark:bg-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-text-primary transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}