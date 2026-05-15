import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Home,
  PieChart,
  PlusCircle,
  Search,
  Menu,
  Moon,
  Sun,
  User,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";
import khbLogo from "../assets/gambar/LOGO KHB.png";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export function Layout({ children, activeTab, onTabChange, onLogout }: LayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const navItems = [
    { id: "dashboard", label: "Beranda", icon: Home },
    { id: "history", label: "Riwayat", icon: Search },
    { id: "scan", label: "Scan", icon: Camera },
    { id: "add", label: "Input", icon: PlusCircle },
    { id: "report", label: "Laporan", icon: PieChart },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-[#333] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex bg-bg-card border-r border-sand flex-col justify-between transition-all duration-300 overflow-hidden",
          isSidebarOpen ? "w-64 p-6" : "w-0 p-0 opacity-0",
        )}
      >
        <div className="space-y-8 w-52">
          <div className="flex flex-col gap-1">
            <img src={khbLogo} alt="KHB Logo" className="h-10 w-auto object-contain object-left mb-1" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest whitespace-nowrap font-bold">
              Komunitas Bandung
            </p>
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-left truncate",
                  activeTab === item.id
                    ? "bg-nature-green/10 text-nature-green font-bold"
                    : "text-text-muted hover:bg-sand/30 hover:text-text-main",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border border-sand bg-sand/30 rounded-2xl w-52">
          <p className="text-xs text-text-muted truncate">Verified Member</p>
          <p className="font-bold text-sm text-text-main uppercase truncate">
            Usaha Mikro
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global Header */}
        <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md transition-colors duration-300 pt-4 pb-3 border-b border-sand/50">
          <div className="px-4 lg:px-8 flex items-center justify-between">
            <div className="relative flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 text-text-muted hover:bg-sand/30 rounded-xl transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="h-5 w-5 text-clay" />
              </button>

              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
              >
                <div className="h-11 w-11 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-tr from-clay/20 to-nature-green/20 border border-clay/30">
                  {user?.photo ? (
                    <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-clay" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col justify-center">
                  <span className="text-[11px] text-text-muted font-bold tracking-wide uppercase mb-0.5">
                    Selamat datang,
                  </span>
                  <span className="text-sm font-extrabold text-text-main leading-tight flex items-center gap-1.5 line-clamp-1 max-w-[120px]">
                    {user?.name || "Pengguna"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-14 left-0 sm:left-auto sm:right-0 mt-2 w-56 bg-bg-card rounded-2xl shadow-xl border border-sand z-50 overflow-hidden">
                    <div className="p-4 border-b border-sand bg-bg-base/50">
                      <p className="text-sm font-bold text-text-main line-clamp-1">{user?.name || "Pengguna"}</p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{user?.email || "pengguna@example.com"}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onTabChange("profile");
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-text-main hover:bg-sand/30 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-text-muted" /> Profil Saya
                      </button>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onTabChange("settings");
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-text-main hover:bg-sand/30 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4 text-text-muted" /> Pengaturan
                      </button>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4 text-red-400" /> Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-main transition-colors active:scale-95"
                title="Toggle Dark Mode"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button 
                onClick={() => onTabChange("notifications")}
                className="relative p-2.5 text-text-main bg-white dark:bg-bg-card rounded-full shadow-sm border border-sand hover:bg-clay hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-clay/50"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-bg-card"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>

        {/* Mobile / Tablet Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-6 left-4 right-4 bg-bg-card/80 backdrop-blur-xl z-50 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-sand">
          <div className="flex justify-between items-center h-20 px-4 relative">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              if (item.id === "scan") {
                return (
                  <div key={item.id} className="relative -top-5">
                    <div className="absolute inset-0 bg-nature-green opacity-20 blur-md rounded-full"></div>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-nature-green to-emerald-400 text-white shadow-xl transition-all duration-300 border-[6px] border-bg-base dark:border-bg-base",
                        isActive ? "scale-105" : "scale-100 hover:scale-105",
                      )}
                    >
                      <item.icon className="h-7 w-7" />
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-full transition-all relative group",
                    isActive
                      ? "text-nature-green font-bold"
                      : "text-text-muted hover:text-clay",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-300 z-10",
                      isActive
                        ? "-translate-y-2"
                        : "translate-y-0 group-hover:scale-110",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] tracking-wide transition-all duration-300 absolute bottom-3 z-10",
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
