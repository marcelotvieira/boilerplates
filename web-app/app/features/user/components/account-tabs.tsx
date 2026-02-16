'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Segurança', href: '/settings/account/security' },
  { label: 'Organizações', href: '/settings/account/organizations' },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors',
            '-mb-px border-b-2',
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
