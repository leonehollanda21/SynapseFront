import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalApiErrorListener } from "@/components/GlobalApiErrorListener";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ContratoACLList from "@/pages/contratos/ContratoACLList";
import ContratoACLForm from "@/pages/contratos/ContratoACLForm";
import ContratoCUSDList from "@/pages/contratos/ContratoCUSDList";
import ContratoCUSDForm from "@/pages/contratos/ContratoCUSDForm";
import FornecedoresList from "@/pages/fornecedores/FornecedoresList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <GlobalApiErrorListener />
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/contratos/acl" element={
                <ProtectedRoute allowedRoles={["Admin", "Analista", "Gestor"]}>
                  <ContratoACLList />
                </ProtectedRoute>
              } />
              <Route path="/contratos/acl/novo" element={
                <ProtectedRoute allowedRoles={["Admin", "Analista"]} requiredAction="contratos.criar">
                  <ContratoACLForm />
                </ProtectedRoute>
              } />
              <Route path="/contratos/cusd" element={
                <ProtectedRoute allowedRoles={["Admin", "Analista", "Gestor"]}>
                  <ContratoCUSDList />
                </ProtectedRoute>
              } />
              <Route path="/contratos/cusd/novo" element={
                <ProtectedRoute allowedRoles={["Admin", "Analista"]} requiredAction="contratos.criar">
                  <ContratoCUSDForm />
                </ProtectedRoute>
              } />
              <Route path="/fornecedores" element={
                <ProtectedRoute allowedRoles={["Admin", "Analista", "Gestor"]} requiredAction="fornecedores.ver">
                  <FornecedoresList />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
