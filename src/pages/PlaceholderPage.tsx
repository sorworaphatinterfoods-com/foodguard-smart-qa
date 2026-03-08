import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  moduleName: string;
}

export default function PlaceholderPage({ title, moduleName }: PlaceholderPageProps) {
  return (
    <AppLayout title={title} showBack>
      <Card>
        <CardContent className="p-8 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{moduleName}</h2>
          <p className="text-sm text-muted-foreground">
            This module is coming soon. Connect to Lovable Cloud to enable database persistence and full functionality.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
