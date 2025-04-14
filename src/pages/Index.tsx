
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect to the chat page if authenticated, otherwise to the login page
  return <Navigate to={isAuthenticated ? "/agents" : "/login"} replace />;
};

export default Index;
