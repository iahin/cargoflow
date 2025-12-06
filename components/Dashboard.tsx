import React, { useMemo } from 'react';
import { Shipment, ShipmentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Truck, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

interface DashboardProps {
  shipments: Shipment[];
}

const Dashboard: React.FC<DashboardProps> = ({ shipments }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: shipments.length,
      inTransit: shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
      delivered: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
      todayRevenue: shipments
        .filter(s => s.dateCreated.startsWith(today))
        .reduce((acc, curr) => acc + curr.total, 0)
    };
  }, [shipments]);

  const chartData = useMemo(() => {
    // Simple grouping by date for the last 7 days (mock logic)
    const data = [
      { name: 'Mon', revenue: 400, weight: 45 },
      { name: 'Tue', revenue: 300, weight: 32 },
      { name: 'Wed', revenue: 550, weight: 60 },
      { name: 'Thu', revenue: 450, weight: 48 },
      { name: 'Fri', revenue: 800, weight: 90 },
      { name: 'Sat', revenue: 600, weight: 70 },
      { name: 'Sun', revenue: stats.todayRevenue || 200, weight: 25 },
    ];
    return data;
  }, [stats.todayRevenue]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Shipments</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Transit</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.inTransit}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Truck className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Delivered</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.delivered}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue (Today)</p>
              <h3 className="text-2xl font-bold text-slate-900">${stats.todayRevenue}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Volume Trends (kg)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
           <h4 className="font-semibold text-yellow-800">Operational Notice</h4>
           <p className="text-sm text-yellow-700">Flight cargo capacity for upcoming Friday (SQ446) is 80% full. Prioritize perishable items.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
