import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/stores/auth-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setTimeout(() => {
      login(token.trim());
      toast.success("登录成功");
      navigate("/admin", { replace: true });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm rounded-3xl shadow-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Lock className="size-6" />
          </div>
          <CardTitle className="text-xl tracking-tight">Lumaris</CardTitle>
          <CardDescription>输入访问令牌以进入管理后台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-sm font-medium">
                访问令牌
              </Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入 Bearer Token"
                className="rounded-xl h-11"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-11 font-medium"
              disabled={loading || !token.trim()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              进入后台
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
