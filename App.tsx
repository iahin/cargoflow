import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ShipmentForm from './components/ShipmentForm';
import TrackingView from './components/TrackingView';
import Invoice from './components/Invoice';
import { getShipments, createShipment } from './services/data';
import { Shipment, UserRole } from './types';
import { Package } from 'lucide-react';

const App: React.FC = () => {
  // Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STAFF);
  
  // App State
  const [currentView, setCurrentView] = useState('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedInvoice, setGeneratedInvoice] = useState<Shipment | null>(null);

  // Initial Load
  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    setLoading(true);
    const data = await getShipments();
    setShipments(data);
    setLoading(false);
  };

  const handleCreateShipment = async (shipment: Shipment) => {
    await createShipment(shipment);
    await loadData();
    setGeneratedInvoice(shipment); // Show invoice immediately
    setCurrentView('dashboard');
  };

  // Simple Login Screen
  if (!isLoggedIn) {
    // If checking public tracking URL (hash routing simulation), user might not need login.
    // For MVP simplicity, we show a landing page that splits into Public Tracking OR Staff Login.
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
               <Package className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">CargoFlow Logistics</h1>
            <p className="text-slate-500 mt-2">Internal Management System</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { setIsLoggedIn(true); setUserRole(UserRole.STAFF); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              Login as Staff
            </button>
            <button 
              onClick={() => { setIsLoggedIn(true); setUserRole(UserRole.ADMIN); }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Login as Admin
            </button>
            <div className="relative my-6">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
               <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Public Access</span></div>
            </div>
            <button 
              onClick={() => setCurrentView('public-tracking')}
              className="w-full py-3 border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-xl font-bold transition-all"
            >
              Track a Shipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Public View Wrapper
  if (currentView === 'public-tracking') {
     return (
       <div>
         <button 
           onClick={() => setIsLoggedIn(false)} 
           className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow text-sm font-medium text-slate-600 z-50"
         >
           Back to Home
         </button>
         <TrackingView />
       </div>
     );
  }

  // Authenticated App
  return (
    <Layout 
      userRole={userRole} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={() => setIsLoggedIn(false)}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full text-slate-400">Loading data...</div>
      ) : (
        <>
          {currentView === 'dashboard' && <Dashboard shipments={shipments} />}
          {currentView === 'new-shipment' && (
            <ShipmentForm 
              onSubmit={handleCreateShipment} 
              onCancel={() => setCurrentView('dashboard')} 
            />
          )}
          {currentView === 'shipments' && (
             <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-200 font-bold text-lg">All Shipments</div>
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500">
                   <tr>
                     <th className="p-4">Tracking #</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Sender</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 text-right">Total</th>
                     <th className="p-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {shipments.map(s => (
                     <tr key={s.id} className="hover:bg-slate-50">
                       <td className="p-4 font-mono font-medium">{s.trackingNumber}</td>
                       <td className="p-4 text-slate-500">{new Date(s.dateCreated).toLocaleDateString()}</td>
                       <td className="p-4">{s.sender.name}</td>
                       <td className="p-4">
                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                           {s.status}
                         </span>
                       </td>
                       <td className="p-4 text-right font-medium">${s.total}</td>
                       <td className="p-4 text-right">
                         <button 
                           onClick={() => setGeneratedInvoice(s)}
                           className="text-blue-600 hover:underline"
                         >
                           View Invoice
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
          {currentView === 'tracking' && <TrackingView />}
          {currentView === 'settings' && (
             <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                <h2 className="text-xl font-bold mb-2">Pricing Configuration</h2>
                <p>Admin feature to modify per-kg rates and fixed item prices.</p>
                <div className="mt-4 p-4 bg-slate-50 inline-block text-left rounded text-sm">
                   <pre>{JSON.stringify({ note: "Pricing logic is defined in constants.ts for MVP" }, null, 2)}</pre>
                </div>
             </div>
          )}
        </>
      )}

      {/* Invoice Modal Overlay */}
      {generatedInvoice && (
        <Invoice shipment={generatedInvoice} onClose={() => setGeneratedInvoice(null)} />
      )}
    </Layout>
  );
};

export default App;
