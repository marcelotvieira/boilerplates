'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Membros', href: '/settings/workspace/members' },
  { label: 'Convites', href: '/settings/workspace/invites' },
];

export function WorkspaceTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors -mb-px border-b-2',
            pathname.startsWith(tab.href)
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
