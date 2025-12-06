import React, { useState } from 'react';
import { getShipmentByTracking } from '../services/data';
import { Shipment, ShipmentStatus } from '../types';
import { Search, MapPin, Calendar, Package, ArrowRight, Truck } from 'lucide-react';

const TrackingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await getShipmentByTracking(query);
      if (data) {
        setResult(data);
      } else {
        setError('Tracking number not found.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: ShipmentStatus) => {
     const steps = [
        ShipmentStatus.CREATED,
        ShipmentStatus.RECEIVED,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.ARRIVED_BD,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED
     ];
     return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
           <div className="inline-flex p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 mb-4">
              <Truck className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-bold text-slate-800">Track Your Shipment</h1>
           <p className="text-slate-500 mt-2">Enter your tracking ID to see real-time updates</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
           <input 
              type="text" 
              placeholder="e.g., TRK-2025-4812" 
              className="w-full p-4 pl-12 rounded-xl border border-slate-300 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg uppercase"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
           <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
           >
              {loading ? 'Searching...' : 'Track'}
           </button>
        </form>

        {error && (
           <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center animate-fade-in">
              {error}
           </div>
        )}

        {result && (
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                 <div>
                    <div className="text-blue-200 text-sm font-medium">Tracking Number</div>
                    <div className="text-2xl font-bold tracking-wider">{result.trackingNumber}</div>
                 </div>
                 <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                       {result.status}
                    </div>
                 </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 p-6 border-b border-slate-100">
                 <div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                       <MapPin className="w-4 h-4" /> Origin
                    </div>
                    <div className="font-semibold text-slate-800">{result.originOffice}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(result.dateCreated).toLocaleDateString()}</div>
                 </div>
                 <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1 justify-end">
                       Destination <MapPin className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-slate-800">{result.receiver.district}, {result.destinationCountry}</div>
                    <div className="text-xs text-slate-500 mt-1">{result.deliveryType}</div>
                 </div>
              </div>

              {/* Timeline (Simplified) */}
              <div className="p-6">
                 <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Shipment Progress</h3>
                 <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      ShipmentStatus.CREATED,
                      ShipmentStatus.IN_TRANSIT,
                      ShipmentStatus.ARRIVED_BD,
                      ShipmentStatus.DELIVERED
                    ].map((step, idx) => {
                       const currentStepIndex = getStatusStep(result.status);
                       const thisStepIndex = getStatusStep(step);
                       const isCompleted = thisStepIndex <= currentStepIndex;
                       const isCurrent = thisStepIndex === currentStepIndex;

                       return (
                          <div key={step} className="relative pl-10">
                             <div className={`absolute left-0 top-1 w-10 h-10 -ml-5 flex items-center justify-center`}>
                                <div className={`w-4 h-4 rounded-full border-4 ${isCompleted ? 'bg-blue-600 border-blue-100' : 'bg-slate-200 border-white'} z-10 transition-colors duration-500`} />
                             </div>
                             <div>
                                <div className={`font-semibold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                   {step}
                                </div>
                                {isCurrent && (
                                   <div className="text-sm text-blue-600 mt-1">
                                      Latest Update: Your package is currently at this stage.
                                   </div>
                                )}
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default TrackingView;
