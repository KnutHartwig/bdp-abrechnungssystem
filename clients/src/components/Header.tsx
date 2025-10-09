import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Settings } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo und Titel */}
          <Link href="/">
            <a className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                BdP
              </div>
              <div>
                <h1 className="text-xl font-bold">Abrechnungssystem</h1>
                <p className="text-xs text-muted-foreground">
                  BdP Baden-Württemberg
                </p>
              </div>
            </a>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/">
                  <a>
                    <Button
                      variant={location === "/" ? "default" : "ghost"}
                    >
                      Abrechnung einreichen
                    </Button>
                  </a>
                </Link>
                <Link href="/admin/login">
                  <a>
                    <Button
                      variant={location === "/admin/login" ? "default" : "outline"}
                    >
                      Admin Login
                    </Button>
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin">
                  <a>
                    <Button
                      variant={location === "/admin" ? "default" : "ghost"}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </a>
                </Link>
                
                {user.rolle === "LANDESKASSE" && (
                  <Link href="/admin/aktionen">
                    <a>
                      <Button
                        variant={location === "/admin/aktionen" ? "default" : "ghost"}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Aktionen
                      </Button>
                    </a>
                  </Link>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rolle: {user.rolle === "LANDESKASSE" ? "Landeskasse" : "Admin"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
