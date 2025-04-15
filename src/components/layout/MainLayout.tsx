
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit size={28} className="text-blue-400" />
            <h1 className="text-xl font-bold">Agent Arena</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline-block">
                {user.name}
              </span>
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
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
        <aside className="w-16 md:w-64 bg-slate-900 text-white pt-6 flex flex-col">
          <nav className="flex-1">
            <ul className="space-y-2 px-2">
              <li>
                <Link
                  to="/"
                  className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                    isActive('/') 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
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
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
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
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
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
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
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
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Settings size={20} />
                  <span className="hidden md:inline-block">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="text-xs text-slate-400 hidden md:block">
              <p>Agent Arena v1.0</p>
              <p>Powered by Google Gemini</p>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
