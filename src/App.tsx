
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AgentProvider } from "@/contexts/AgentContext";
import MainLayout from "@/components/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import ConfigPage from "@/pages/ConfigPage";
import NotFound from "@/pages/NotFound";

// Private route component to handle authentication
const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? (
    <MainLayout>{element}</MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AgentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/" element={<PrivateRoute element={<ChatPage />} />} />
              <Route path="/agents" element={<PrivateRoute element={<ConfigPage defaultTab="agents" />} />} />
              <Route path="/tools" element={<PrivateRoute element={<ConfigPage defaultTab="tools" />} />} />
              <Route path="/database" element={<PrivateRoute element={<ConfigPage defaultTab="database" />} />} />
              <Route path="/settings" element={<PrivateRoute element={<ConfigPage defaultTab="models" />} />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AgentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
