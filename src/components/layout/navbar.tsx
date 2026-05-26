import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MapPin, School } from "lucide-react";

const navLinks = [
  { to: "/map", label: "地图", icon: MapPin },
  { to: "/schools", label: "学校", icon: School },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="size-4" />
          </div>
          <span>Lumaris</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
