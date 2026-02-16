'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { settingsNav } from '@/app/(protected)/settings/config';

export function SettingsNav() {
  const sections = settingsNav;
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-1">
          {section.title && (
            <h3 className="mb-2 px-3 text-xs tracking-wider text-muted-foreground">
              {section.title}
            </h3>
          )}
          <ul className="flex flex-col gap-1">
            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = hasChildren
                ? item.children!.some((child) => pathname === child.href)
                : pathname === item.href || pathname.startsWith(item.href + '/');

              if (hasChildren) {
                return (
                  <li key={item.href}>
                    <Collapsible defaultOpen={isActive} className="group/collapsible">
                      <CollapsibleTrigger
                        className={cn(
                          'flex w-full items-center justify-between rounded-md p-2 h-8 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <item.icon className="size-4" />}
                          {item.label}
                        </span>
                        <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="flex flex-col gap-1 mt-1 ml-3 border-l pl-2">
                          {item.children!.map((child) => {
                            const isChildActive = pathname === child.href;
                            const childClassName = cn(
                              'flex items-center rounded-md px-2 h-7 text-sm transition-colors',
                              isChildActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            );
                            return (
                              <li key={child.href}>
                                {isChildActive ? (
                                  <span className={childClassName}>{child.label}</span>
                                ) : (
                                  <Link href={child.href} className={childClassName}>
                                    {child.label}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }

              const itemClassName = cn(
                'flex items-center gap-2 rounded-md p-2 h-8 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
              );

              return (
                <li key={item.href}>
                  {isActive ? (
                    <span className={itemClassName}>
                      {item.icon && <item.icon className="size-4" />}
                      {item.label}
                    </span>
                  ) : (
                    <Link href={item.href} className={itemClassName}>
                      {item.icon && <item.icon className="size-4" />}
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
