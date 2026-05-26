import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MapPin, School, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/stores/auth-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { to: "/admin/map", label: "地图管理", icon: MapPin },
  { to: "/admin/schools", label: "学校管理", icon: School },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/admin"
        className="flex items-center gap-2.5 px-6 py-5 font-semibold text-lg tracking-tight border-b border-border/50"
        onClick={onNavigate}
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MapPin className="size-4" />
        </div>
        <span>Lumaris</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border/50 space-y-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          退出登录
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <div className="flex h-14 items-center border-b border-border/50 px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/admin" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight ml-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-3.5" />
            </div>
            <span>Lumaris</span>
          </Link>
        </div>
      </>
    );
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-muted/30 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
