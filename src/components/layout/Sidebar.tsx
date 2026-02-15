import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  DollarSign,
  Building2,
  Users,
  BarChart3,
  Menu,
  Car,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "fretes-andamento", label: "Fretes em Andamento", icon: Truck },
  { id: "historico", label: "Histórico de Cargas", icon: ClipboardList },
  { id: "saldos", label: "Gestão de Saldos", icon: DollarSign },
  { id: "clientes", label: "Clientes", icon: Building2 },
  { id: "motoristas", label: "Motoristas", icon: Users },
  { id: "veiculos", label: "Veículos", icon: Car },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

function SidebarContent({
  activeSection,
  onSectionChange,
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const { signOut, user, userRole } = useAuth();

  return (
    <nav className="w-full h-full gradient-dark flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="text-center py-8 px-4 border-b border-primary">
        <h1 className="text-3xl font-bold text-primary tracking-widest">ROCCIA</h1>
        <p className="text-muted-foreground text-sm font-medium tracking-wider mt-1">
          TRANSPORTES
        </p>
      </div>

      {/* Navigation Menu */}
      <ul className="py-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => {
                  onSectionChange(item.id);
                  onClose?.();
                }}
                className={cn(
                  "nav-link w-full text-left",
                  activeSection === item.id && "active"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* User info & Logout */}
      <div className="border-t border-primary p-4 space-y-2">
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        <p className="text-xs text-primary font-semibold uppercase">{userRole || "—"}</p>
        <button
          onClick={signOut}
          className="nav-link w-full text-left text-destructive hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary tracking-widest">ROCCIA</h1>
            <span className="text-muted-foreground text-xs">TRANSPORTES</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-2 border-primary">
              <SidebarContent
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onClose={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 border-r-2 border-primary flex-shrink-0">
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </div>
    </>
  );
}
