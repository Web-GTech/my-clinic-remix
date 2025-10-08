import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Activity, Loader2 } from "lucide-react";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole) {
        switch (userRole) {
          case "recepcionista":
            navigate("/recepcao");
            break;
          case "medicacao":
            navigate("/medicacao");
            break;
          case "doutor":
            navigate("/doutor");
            break;
          default:
            navigate("/auth");
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-secondary/10">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
