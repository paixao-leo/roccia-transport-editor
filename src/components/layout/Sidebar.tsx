import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Truck, 
  ClipboardList, 
  DollarSign, 
  Building2, 
  Users, 
  BarChart3 
} from "lucide-react";

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
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <nav className="w-72 gradient-dark border-r-2 border-primary flex flex-col overflow-y-auto">
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
                onClick={() => onSectionChange(item.id)}
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
    </nav>
  );
}
