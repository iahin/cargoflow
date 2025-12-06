import React from 'react';
import { Shipment, OfficeLocation } from '../types';
import { OFFICES } from '../constants';
import { Printer, Download, X } from 'lucide-react';

interface InvoiceProps {
  shipment: Shipment;
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ shipment, onClose }) => {
  const office = OFFICES.find(o => o.id === shipment.originOffice) || OFFICES[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg print:hidden">
          <h3 className="font-bold text-slate-700">Invoice Generated</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-md text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content - Printable Area */}
        <div className="p-12 overflow-auto print:p-0 print:overflow-visible" id="invoice-content">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">Invoice</h1>
               <div className="mt-2 text-slate-600">
                  <p className="font-bold">{office.name}</p>
                  <p className="text-sm">{office.address}</p>
                  <p className="text-sm">{office.phone}</p>
               </div>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-bold text-blue-600">CargoFlow Logistics</h2>
               <div className="mt-4 text-sm text-slate-600">
                  <p><span className="font-bold">Invoice #:</span> INV-{shipment.id}</p>
                  <p><span className="font-bold">Date:</span> {new Date(shipment.dateCreated).toLocaleDateString()}</p>
                  <p><span className="font-bold">Tracking:</span> {shipment.trackingNumber}</p>
               </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">From (Sender)</h4>
              <p className="font-bold text-slate-800">{shipment.sender.name}</p>
              <p className="text-sm text-slate-600">{shipment.sender.address}</p>
              <p className="text-sm text-slate-600">{shipment.sender.phone}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">To (Receiver)</h4>
              <p className="font-bold text-slate-800">{shipment.receiver.name}</p>
              <p className="text-sm text-slate-600">{shipment.receiver.address}, {shipment.receiver.district}</p>
              <p className="text-sm text-slate-600">{shipment.receiver.phone}</p>
              <p className="text-sm text-slate-600 mt-1 italic">{shipment.destinationCountry}</p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
             <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                   <th className="py-2 px-3 text-left text-xs font-bold text-slate-600 uppercase">Description</th>
                   <th className="py-2 px-3 text-right text-xs font-bold text-slate-600 uppercase">Qty</th>
                   <th className="py-2 px-3 text-right text-xs font-bold text-slate-600 uppercase">Weight</th>
                   <th className="py-2 px-3 text-right text-xs font-bold text-slate-600 uppercase">Amount</th>
                </tr>
             </thead>
             <tbody className="text-sm">
                {shipment.parcels.map((p, i) => (
                   <tr key={i} className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{p.description}</div>
                        <div className="text-xs text-slate-500">{p.category}</div>
                      </td>
                      <td className="py-3 px-3 text-right">{p.quantity}</td>
                      <td className="py-3 px-3 text-right">{p.chargeableWeight} kg</td>
                      <td className="py-3 px-3 text-right font-medium">${p.totalPrice.toFixed(2)}</td>
                   </tr>
                ))}
             </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
             <div className="w-1/2 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                   <span>Subtotal</span>
                   <span>${shipment.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                   <span>Tax</span>
                   <span>${shipment.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-300 pt-2">
                   <span>Total Due</span>
                   <span>SGD {shipment.total.toFixed(2)}</span>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-200">
             <p>Terms: Goods are shipped subject to standard air cargo liability limitations. Prohibited items found will be discarded.</p>
             <p className="mt-1">Thank you for shipping with CargoFlow!</p>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
