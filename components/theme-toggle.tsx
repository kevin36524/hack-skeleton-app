'use client';

import { IconButton } from '@yahoo/uds';
import { UDSIcons } from '@/lib/uds-icons-map';
import { useTheme } from '@/lib/theme-context';

interface ThemeToggleProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, variant = 'tertiary', size = 'sm' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <IconButton
      name={resolvedTheme === 'dark' ? UDSIcons.Moon : UDSIcons.Sun}
      variant={variant}
      size={size}
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={className}
    />
  );
}