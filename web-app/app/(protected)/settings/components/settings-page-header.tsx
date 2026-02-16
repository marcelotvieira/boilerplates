interface SettingsPageHeaderProps {
  title: string;
  description: string;
}

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
