
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Settings, 
  LogOut, 
  Users, 
  Database, 
  BrainCircuit,
  Wrench
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-background border-b border-border p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit size={28} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Agent Arena</h1>
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
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 bg-sidebar text-sidebar-foreground pt-6 flex flex-col border-r border-border">
          <nav className="flex-1">
            <ul className="space-y-2 px-2">
              <li>
                <Link
                  to="/"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <MessageSquare size={20} />
                  <span className="hidden md:inline-block">Chat</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/agents"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/agents') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Users size={20} />
                  <span className="hidden md:inline-block">Agents</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/tools') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Wrench size={20} />
                  <span className="hidden md:inline-block">Tools</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/database"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/database') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Database size={20} />
                  <span className="hidden md:inline-block">Database</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/settings') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Settings size={20} />
                  <span className="hidden md:inline-block">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="text-xs text-sidebar-foreground opacity-70 hidden md:block">
              <p>Agent Arena v1.0</p>
              <p>Powered by Google Gemini</p>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
