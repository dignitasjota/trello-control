'use client';

import { PROJECT_ICONS } from '@/lib/types';

interface ProjectIconProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
};

export default function ProjectIcon({ icon, color, size = 'md' }: ProjectIconProps) {
  const iconData = PROJECT_ICONS.find(i => i.id === icon) || PROJECT_ICONS[0];
  const s = SIZES[size];

  return (
    <div
      className={`${s.container} rounded-lg flex items-center justify-center shrink-0`}
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
    >
      <svg
        className={s.icon}
        fill="none"
        stroke={color}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconData.svg} />
      </svg>
    </div>
  );
}
