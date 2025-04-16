
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Wrench, 
  Database, 
  Settings,
  BrainCircuit,
  FolderOpen,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const TopNavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Chat', icon: MessageSquare },
    { path: '/agents', label: 'Agents', icon: Users },
    { path: '/tools', label: 'Tools', icon: Wrench },
    { path: '/knowledge', label: 'Knowledge', icon: FolderOpen },
    { path: '/database', label: 'Database', icon: Database },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <div className="w-full bg-background border-b border-border py-2 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <BrainCircuit size={28} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Agent Arena</h1>
          </div>
          
          <nav className="hidden md:flex">
            <ul className="flex space-x-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.path) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline-block text-foreground">
              {user.name}
            </span>
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-foreground hover:bg-secondary">
              <LogOut size={16} className="mr-2" />
              <span className="hidden md:inline-block">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
