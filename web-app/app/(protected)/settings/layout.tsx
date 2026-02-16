import { SettingsNav } from '@/components/settings-nav';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta.
        </p>
      </div>

      <div className="!min-h-[76vh]">
        <Card className="!w-full min-h-full min-h-[76vh] shadow-lg">
          <CardContent className="flex flex-col gap-4 md:flex-row">

            <aside className="md:w-56 md:shrink-0">
              <div className="sticky top-20">
                <SettingsNav />
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="border-l px-4 pb-4 space-y-8">{children}</div>
            </main>
          </CardContent>

        </Card>

      </div>
    </div>
  );
}
