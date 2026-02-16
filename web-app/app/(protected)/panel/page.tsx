import { Card } from '@/components/ui/card';

export default async function PanelPage() {
  // const session = await getSession();

  return (
    <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 ">
      {
        new Array(32).fill(0).map((i, idx) => (
          <Card key={idx} className={'w-full h-48'} />
        ))
      }
    </div>
  );
}
