import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  Cpu,
  Car,
  KeyRound,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Building2 },
    { name: "Users & Staff", href: "/users", icon: Users },
    { name: "GPS Devices", href: "/gps-devices", icon: Cpu },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "GPS Allocations", href: "/allocations", icon: FileSpreadsheet },
    { name: "Vehicle Mappings", href: "/mappings", icon: KeyRound },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Mobile Sidebar Overlays ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Component ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:relative lg:transform-none lg:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div>
          {/* Header/Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                VLTS Tenant
              </span>
            </Link>
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || user?.email || "Tenant Admin"}
              </p>
              <p className="text-[10px] text-slate-500 capitalize truncate">
                {user?.role?.name || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-950 capitalize lg:text-xl">
              {navigation.find((n) => n.href === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">
                {user?.email || "admin@vlts.com"}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                {user?.designation || "SYSTEM"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
