import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useStore } from '../store';
import { LayoutDashboard, BookOpen, Activity, Users, LogOut, GraduationCap, ClipboardCheck } from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['coach', 'player'] },
    { name: 'Playbook', path: '/playbook', icon: BookOpen, roles: ['coach', 'player'] },
    { name: 'Install Training', path: '/training', icon: GraduationCap, roles: ['player', 'coach'] },
    { name: 'Quiz Mode', path: '/quiz', icon: ClipboardCheck, roles: ['player'] },
    { name: 'Progress Tracking', path: '/progress', icon: Activity, roles: ['coach', 'player'] },
    { name: 'Team Rankings', path: '/rankings', icon: Users, roles: ['coach', 'player'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role || 'player'));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="font-display font-bold text-xl text-primary tracking-wide">MEHS OL</h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-muted-foreground hover:text-red-400 transition-colors w-full px-2 py-2 text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 md:hidden">
          <h1 className="font-display font-bold text-lg text-primary tracking-wide">MEHS OL</h1>
          <button onClick={handleLogout} className="text-muted-foreground"><LogOut size={20}/></button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
