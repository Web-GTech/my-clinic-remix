import { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const getRoleName = (role: string | null) => {
    switch (role) {
      case "recepcionista":
        return "Recepção";
      case "medicacao":
        return "Medicação";
      case "doutor":
        return "Médico";
      default:
        return "Usuário";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary/10">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground">{getRoleName(userRole)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/chat")}
              className="text-muted-foreground hover:text-foreground"
            >
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/painel")}
              className="text-muted-foreground hover:text-foreground"
            >
              Painel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8 px-4 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
