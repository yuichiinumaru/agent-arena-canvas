
import React from 'react';
import TopNavBar from './TopNavBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Top Navigation */}
      <TopNavBar />
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
