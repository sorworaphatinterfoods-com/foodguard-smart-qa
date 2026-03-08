import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AppLayout({ children, title, showBack }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader title={title} showBack={showBack} />
      <main className="flex-1 pb-20 px-4 pt-4 max-w-4xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
