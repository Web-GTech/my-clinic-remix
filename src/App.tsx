import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Recepcao from "./pages/Recepcao";
import Medicacao from "./pages/Medicacao";
import Doutor from "./pages/Doutor";
import DoutorNew from "./pages/DoutorNew";
import Painel from "./pages/Painel";
import PainelPublico from "./pages/PainelPublico";
import Chat from "./pages/Chat";
import Produtos from "./pages/Produtos";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/painel" element={<PainelPublico />} />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/recepcao"
              element={
                <ProtectedRoute allowedRoles={["recepcionista", "doutor"]}>
                  <Recepcao />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medicacao"
              element={
                <ProtectedRoute allowedRoles={["medicacao", "doutor"]}>
                  <Medicacao />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doutor"
              element={
                <ProtectedRoute allowedRoles={["doutor"]}>
                  <DoutorNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <ProtectedRoute allowedRoles={["recepcionista", "doutor"]}>
                  <Produtos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/:id"
              element={
                <ProtectedRoute allowedRoles={["recepcionista", "medicacao", "doutor"]}>
                  <ClienteDetalhes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <ProtectedRoute allowedRoles={["doutor"]}>
                  <Financeiro />
                </ProtectedRoute>
              }
            />
            <Route
              path="/painel-admin"
              element={
                <ProtectedRoute allowedRoles={["recepcionista", "doutor"]}>
                  <Painel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={["recepcionista", "medicacao", "doutor"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
