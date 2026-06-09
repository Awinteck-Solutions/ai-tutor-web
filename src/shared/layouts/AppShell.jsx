import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import { AdesiaIcon } from '../components/AdesiaIcon';
import { AdesiaLogo } from '../components/AdesiaLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { GlowOrbs } from '../components/GlowOrbs';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_KEY = 'adesia-sidebar-collapsed';

const NavContent = ({ navGroups, collapsed, onNavigate, mobileOpen, toggleMobile }) => (
  <nav className="flex-1 overflow-y-auto p-3">
    {navGroups.map((group) => (
      <div key={group.title}>
        {!collapsed && <p className="nav-section-title">{group.title}</p>}
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={collapsed ? item.label : undefined}
                onClick={() => mobileOpen && toggleMobile()}
                className={({ isActive }) =>
                  `nav-link ${collapsed ? 'nav-link-collapsed justify-center px-2' : ''} ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

const Sidebar = ({
  navGroups,
  portalLabel,
  user,
  onLogout,
  showClose,
  onClose,
  mobileOpen,
  collapsed,
  onToggleCollapse,
}) => (
  <div className="flex h-full flex-col">
    <div className={`flex items-center border-b border-border/50 p-3 ${collapsed ? 'justify-center' : 'gap-2 p-4'}`}>
      {!collapsed && <AdesiaLogo size="sm" className="min-w-0 flex-1" />}
      {collapsed && (
        <Link to="/" className="no-underline" aria-label="Adesia home">
          <AdesiaIcon className="h-9 w-9 rounded-xl shadow-glow-sm ring-1 ring-primary/30" />
        </Link>
      )}
      {!collapsed && (
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {portalLabel}
        </span>
      )}
      {showClose && (
        <button
          type="button"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>

    {!showClose && (
      <div className={`border-b border-border/50 px-2 py-2 ${collapsed ? 'flex justify-center' : 'px-3'}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    )}

    <NavContent
      navGroups={navGroups}
      collapsed={collapsed && !showClose}
      mobileOpen={mobileOpen}
      toggleMobile={onClose}
    />

    <div className={`border-t border-border/50 p-3 ${collapsed ? 'px-2' : ''}`}>
      {!collapsed && (
        <div className="mb-3 rounded-xl border border-border/50 bg-muted/50 px-3 py-2">
          <p className="text-sm font-medium text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        title={collapsed ? 'Sign out' : undefined}
        className={`nav-link w-full text-left hover:text-destructive ${collapsed ? 'nav-link-collapsed justify-center px-2' : ''}`}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && 'Sign out'}
      </button>
    </div>
  </div>
);

const AppShell = ({
  navGroups,
  homePath,
  portalLabel,
  banner,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);
  const toggleCollapse = () => setCollapsed((c) => !c);

  const sidebarWidth = collapsed ? 'w-[4.5rem]' : 'w-64';

  return (
    <div className="relative min-h-screen bg-background">
      <GlowOrbs />
      <div className="relative flex min-h-screen">
        <aside className={`hidden shrink-0 border-r border-border/50 bg-card/40 backdrop-blur-xl transition-[width] duration-200 lg:block ${sidebarWidth}`}>
          <Sidebar
            navGroups={navGroups}
            portalLabel={portalLabel}
            user={user}
            onLogout={handleLogout}
            mobileOpen={false}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
          />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={closeMobile}
              aria-label="Close menu"
            />
            <aside className="relative h-full w-72 border-r border-border/50 bg-card backdrop-blur-xl">
              <Sidebar
                navGroups={navGroups}
                portalLabel={portalLabel}
                user={user}
                onLogout={handleLogout}
                showClose
                onClose={closeMobile}
                mobileOpen
                collapsed={false}
                onToggleCollapse={toggleCollapse}
              />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-background/90 px-4 backdrop-blur-xl lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <AdesiaLogo to={homePath} size="sm" className="lg:hidden" />
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-4 lg:p-8">
            {banner}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
