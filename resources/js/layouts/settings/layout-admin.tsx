import { Link, usePage }         from '@inertiajs/react';
import { cn }                    from '@/lib/utils';
import Heading                   from '@/components/heading';
import { Button }                from '@/components/ui/button';
import { Separator }             from '@/components/ui/separator';

const tabs = [
  { title: 'Profile',   url: '/admin/settings/profile'   },
  { title: 'Password',  url: '/admin/settings/password'  },
  { title: 'Appearance',url: '/admin/settings/appearance'},
];

export default function AdminSettingsLayout({ children }:{children:React.ReactNode}) {
  const path = usePage().url;

  return (
    <div className="px-4 py-6">
      <Heading title="Admin settings" description="Manage your admin account" />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* inner settings nav */}
        <aside className="w-full max-w-xl lg:w-48 space-y-1">
          {tabs.map(t => (
            <Button key={t.url} asChild size="sm" variant="ghost"
                    className={cn('w-full justify-start',{'bg-muted':path.startsWith(t.url)})}>
              <Link href={t.url}>{t.title}</Link>
            </Button>
          ))}
        </aside>

        <Separator className="my-6 md:hidden"/>

        <section className="flex-1 md:max-w-2xl max-w-xl space-y-12">
          {children}
        </section>
      </div>
    </div>
  );
}
