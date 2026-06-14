import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Thermometer, AlertTriangle, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/receiving', icon: ClipboardList, label: 'Receiving' },
  { path: '/ccp', icon: Thermometer, label: 'CCP' },
  { path: '/ncr', icon: AlertTriangle, label: 'NCR' },
  { path: '/more', icon: MoreHorizontal, label: 'More' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border print:hidden">
      <div className="flex items-center justify-around h-16 max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
