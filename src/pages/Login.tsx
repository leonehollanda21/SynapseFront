import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";
import type { PerfilUsuario } from "@/types/synapse";

// Demo users for testing without API
const DEMO_USERS: Record<string, { nome: string; perfil: PerfilUsuario }> = {
  "admin@synapse.com": { nome: "Admin Silva", perfil: "Admin" },
  "analista@synapse.com": { nome: "Analista Santos", perfil: "Analista" },
  "gestor@synapse.com": { nome: "Gestor Oliveira", perfil: "Gestor" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.login({ email, senha });
      login(response.token, response.usuario);
      navigate("/");
    } catch {
      // Fallback: demo mode
      const demo = DEMO_USERS[email];
      if (demo && senha === "senha123") {
        login("demo-token-" + Date.now(), {
          id: Math.floor(Math.random() * 100),
          email,
          nome: demo.nome,
          perfil: demo.perfil,
        });
        toast({
          title: "Login realizado (modo demo)",
          description: `Bem-vindo, ${demo.nome}!`,
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Email ou senha inválidos.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center">
              <Zap className="h-6 w-6 text-emerald" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground">Synapse Energy</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Inteligência Energética
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="analista@synapse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
            <p className="font-medium">Usuários demo:</p>
            <p>admin@synapse.com / senha123</p>
            <p>analista@synapse.com / senha123</p>
            <p>gestor@synapse.com / senha123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
