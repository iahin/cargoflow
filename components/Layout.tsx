import React from 'react';
import { Package, LayoutDashboard, Settings, LogOut, Search, Menu, PlusCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, currentView, onNavigate, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
               <span className="text-xl font-bold text-slate-800">CargoFlow</span>
             </div>
             <div className="mt-2 text-xs text-slate-400 uppercase font-semibold tracking-wider">{userRole} Portal</div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="new-shipment" icon={PlusCircle} label="New Shipment" />
            <NavItem view="shipments" icon={Package} label="All Shipments" />
            <NavItem view="tracking" icon={Search} label="Tracking Search" />
            {userRole === UserRole.ADMIN && (
               <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase">Admin</div>
                  <NavItem view="settings" icon={Settings} label="Pricing Rules" />
               </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 z-30">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
             <span className="font-bold text-slate-800">CargoFlow</span>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
