import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Briefcase, 
  LayoutDashboard, 
  Users,
  ChevronDown
} from "lucide-react";

export function Navigation() {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = {
    student: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Opportunities", href: "/jobs", icon: Briefcase },
    ],
    employer: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Opportunities", href: "/jobs", icon: Briefcase },
    ],
    admin: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Opportunities", href: "/jobs", icon: Briefcase },
      { label: "Users", href: "/users", icon: Users },
    ],
    officer: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Opportunities", href: "/jobs", icon: Briefcase },
      { label: "Users", href: "/users", icon: Users },
    ],
  };

  const items = navItems[user.role as keyof typeof navItems] || navItems.student;

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="font-bold text-lg text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">
              CampusPlace
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors cursor-pointer
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 border-b border-slate-200">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-600 capitalize mt-0.5">{user.role}</p>
                </div>
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
