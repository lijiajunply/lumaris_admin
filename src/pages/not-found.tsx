import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <p className="text-8xl font-bold tracking-tight text-muted-foreground/20">404</p>
      <h1 className="text-xl font-semibold mt-6 tracking-tight">页面未找到</h1>
      <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-sm">
        您访问的页面不存在或已被移除
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          返回上页
        </Button>
        <Button className="rounded-xl gap-2" onClick={() => navigate("/")}>
          <Home className="size-4" />
          返回首页
        </Button>
      </div>
    </div>
  );
}
