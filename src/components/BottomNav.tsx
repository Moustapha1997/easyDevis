import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Plus, Users, Package } from "lucide-react";

const items = [
  { title: "Accueil",   url: "/",             icon: LayoutDashboard },
  { title: "Devis",     url: "/quotes",        icon: FileText },
  { title: "Créer",     url: "/create-quote",  icon: Plus,   primary: true },
  { title: "Clients",   url: "/clients",       icon: Users },
  { title: "Services",  url: "/products",      icon: Package },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const active = pathname === item.url;
          if (item.primary) {
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 -mt-4">
                  <item.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] mt-1 font-medium text-blue-600">{item.title}</span>
              </NavLink>
            );
          }
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${active ? "text-blue-600" : "text-gray-400"}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${active ? "text-blue-600" : "text-gray-400"}`}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
