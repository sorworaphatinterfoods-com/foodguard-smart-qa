import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell, Shield } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function AppHeader({ title, showBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = title || getTitleFromPath(location.pathname);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border print:hidden">
      <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm truncate">{pageTitle}</span>
          </div>
        </div>
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  );
}

function getTitleFromPath(path: string): string {
  const map: Record<string, string> = {
    '/': 'Smart QA Factory',
    '/receiving': 'Raw Material Receiving',
    '/receiving/new': 'New Receiving',
    '/ccp': 'CCP Monitoring',
    '/ccp/new': 'Log CCP Value',
    '/ncr': 'NCR / CAPA',
    '/ncr/new': 'New NCR',
    '/environment': 'Environmental Monitoring',
    '/calibration': 'Calibration',
    '/audit': 'Internal Audit',
    '/complaints': 'Complaints',
    '/traceability': 'Traceability',
  };
  return map[path] || 'Smart QA Factory';
}
