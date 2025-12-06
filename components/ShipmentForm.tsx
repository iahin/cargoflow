
import React, { useState, useEffect } from 'react';
import { Parcel, ParcelCategory, Shipment, ShipmentStatus, OfficeLocation } from '../types';
import { PRICING_RULES, VOLUMETRIC_DIVISOR, PROHIBITED_ITEMS } from '../constants';
import { generateTrackingNumber } from '../services/data';
import { Plus, Trash2, Calculator, AlertTriangle, Save, Check } from 'lucide-react';

type PricingRule = {
  pricePerKg?: number;
  minWeight?: number;
  isFixed: boolean;
  fixedPrice?: number;
  tax?: number;
};

interface ShipmentFormProps {
  onSubmit: (shipment: Shipment) => void;
  onCancel: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({ onSubmit, onCancel }) => {
  // Sender & Receiver
  const [sender, setSender] = useState({ name: '', phone: '', address: '' });
  const [receiver, setReceiver] = useState({ name: '', phone: '', address: '', district: '' });
  
  // Logistics
  const [originOffice, setOriginOffice] = useState<OfficeLocation>(OfficeLocation.SG);
  const [deliveryType, setDeliveryType] = useState<'Office Pickup' | 'Home Delivery'>('Office Pickup');
  
  // Parcels
  const [parcels, setParcels] = useState<Partial<Parcel>[]>([
    { id: '1', category: ParcelCategory.MIXED, quantity: 1, actualWeight: 0, length: 0, width: 0, height: 0 }
  ]);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Validation
  const [warnings, setWarnings] = useState<string[]>([]);

  // Calculation Logic
  useEffect(() => {
    let newSubtotal = 0;
    let newTax = 0;
    const currentWarnings: string[] = [];

    // Use a simpler dependency tracker string
    const depString = parcels.map(p => `${p.category}-${p.actualWeight}-${p.length}-${p.width}-${p.height}-${p.quantity}`).join('|');

    const updatedParcels = parcels.map(parcel => {
      // 1. Calculate Volumetric
      const volWeight = ((parcel.length || 0) * (parcel.width || 0) * (parcel.height || 0)) / VOLUMETRIC_DIVISOR || 0;
      
      // 2. Determine Chargeable
      const rule = PRICING_RULES[parcel.category as ParcelCategory] as PricingRule;
      const chargeable = Math.max(parcel.actualWeight || 0, volWeight);
      
      let lineTotal = 0;
      let lineTax = 0;

      if (rule) {
        if (rule.isFixed) {
          // Fixed Price Item
          lineTotal = (rule.fixedPrice || 0) * (parcel.quantity || 1);
        } else {
          // Per Kg Item
          let weightToCharge = chargeable;
          // Minimum weight rule (e.g., Mixed items min 10kg)
          if (rule.minWeight && chargeable < rule.minWeight) {
             // We don't change chargeable weight display, but price calculation uses min
             weightToCharge = rule.minWeight;
             // Avoid duplicate warnings for same parcel
             const warningMsg = `Parcel ${parcel.id}: Minimum weight of ${rule.minWeight}kg applied for pricing.`;
             if (!currentWarnings.includes(warningMsg)) {
                 currentWarnings.push(warningMsg);
             }
          }
          lineTotal = weightToCharge * (rule.pricePerKg || 0);
        }

        // Apply Tax if any
        if (rule.tax) {
            lineTax = lineTotal * rule.tax;
        }
      }

      newSubtotal += lineTotal;
      newTax += lineTax;

      return {
        ...parcel,
        volumetricWeight: parseFloat(volWeight.toFixed(2)),
        chargeableWeight: parseFloat(chargeable.toFixed(2)),
        unitPrice: parseFloat((lineTotal / (parcel.quantity || 1)).toFixed(2)),
        totalPrice: parseFloat(lineTotal.toFixed(2))
      };
    });

    setSubtotal(parseFloat(newSubtotal.toFixed(2)));
    setTaxTotal(parseFloat(newTax.toFixed(2)));
    setGrandTotal(parseFloat((newSubtotal + newTax).toFixed(2)));
    setWarnings(currentWarnings);

  }, [parcels.map(p => `${p.category}-${p.actualWeight}-${p.length}-${p.width}-${p.height}-${p.quantity}`).join('|')]);


  const handleParcelChange = (id: string, field: keyof Parcel, value: any) => {
    setParcels(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addParcel = () => {
    setParcels(prev => [
      ...prev,
      { 
        id: Math.random().toString(36).substr(2, 9), 
        category: ParcelCategory.MIXED, 
        quantity: 1, 
        actualWeight: 0, length: 0, width: 0, height: 0 
      }
    ]);
  };

  const removeParcel = (id: string) => {
    if (parcels.length > 1) {
      setParcels(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.name || !receiver.name) {
      alert("Please fill in sender and receiver details");
      return;
    }

    const fullParcels = parcels.map(p => {
        const vol = ((p.length || 0) * (p.width || 0) * (p.height || 0)) / VOLUMETRIC_DIVISOR;
        const chargeable = Math.max(p.actualWeight || 0, vol);
        const rule = PRICING_RULES[p.category as ParcelCategory] as PricingRule;
        let price = 0;
        if(rule.isFixed) price = (rule.fixedPrice || 0) * (p.quantity || 1);
        else price = (Math.max(chargeable, rule.minWeight || 0)) * (rule.pricePerKg || 0);

        return {
            ...p,
            volumetricWeight: vol,
            chargeableWeight: chargeable,
            unitPrice: price / (p.quantity || 1),
            totalPrice: price
        } as Parcel;
    });

    const newShipment: Shipment = {
      id: Math.random().toString(36).substr(2, 9),
      trackingNumber: generateTrackingNumber(),
      sender,
      receiver,
      originOffice,
      destinationCountry: 'Bangladesh',
      status: ShipmentStatus.CREATED,
      dateCreated: new Date().toISOString(),
      parcels: fullParcels,
      deliveryType,
      subtotal,
      tax: taxTotal,
      total: grandTotal,
      notes: warnings.join('; ')
    };

    onSubmit(newShipment);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">New Shipment Order</h2>
        <div className="text-sm text-slate-500">
            Origin: <span className="font-semibold text-blue-600">{originOffice}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Sender Details
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="Full Name" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={sender.name} onChange={e => setSender({...sender, name: e.target.value})} required />
              <input type="text" placeholder="Phone Number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={sender.phone} onChange={e => setSender({...sender, phone: e.target.value})} required />
              <textarea placeholder="Address (Singapore/Malaysia)" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20" 
                value={sender.address} onChange={e => setSender({...sender, address: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">2</span>
              Receiver Details (Bangladesh)
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="Full Name" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                 value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} required />
              <input type="text" placeholder="Phone Number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                 value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value})} required />
              <div className="flex gap-2">
                 <input type="text" placeholder="District" className="w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={receiver.district} onChange={e => setReceiver({...receiver, district: e.target.value})} />
                 <input type="text" placeholder="Full Address" className="w-2/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={receiver.address} onChange={e => setReceiver({...receiver, address: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Parcels */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">3</span>
              Parcels & Pricing
            </h3>
            <button type="button" onClick={addParcel} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
               <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 rounded-l-lg">Description & Category</th>
                  <th className="p-3 w-20">Qty</th>
                  <th className="p-3 w-24">Weight (kg)</th>
                  <th className="p-3 w-48">Dimensions (L x W x H cm)</th>
                  <th className="p-3 text-right">Chargeable</th>
                  <th className="p-3 text-right rounded-r-lg">Price ($)</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parcels.map((parcel, idx) => {
                    const rule = PRICING_RULES[parcel.category as ParcelCategory] as PricingRule;
                    const vol = ((parcel.length || 0) * (parcel.width || 0) * (parcel.height || 0)) / VOLUMETRIC_DIVISOR;
                    const chargeable = Math.max(parcel.actualWeight || 0, vol);
                    let price = 0;
                    if(rule?.isFixed) price = (rule.fixedPrice || 0) * (parcel.quantity || 1);
                    else price = (Math.max(chargeable, rule?.minWeight || 0)) * (rule?.pricePerKg || 0);

                    return (
                    <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 space-y-2">
                         <input 
                            type="text" 
                            placeholder="Item description" 
                            className="w-full p-2 border border-slate-200 rounded text-xs"
                            value={parcel.description || ''}
                            onChange={(e) => handleParcelChange(parcel.id!, 'description', e.target.value)}
                         />
                         <select 
                            className="w-full p-2 border border-slate-200 rounded text-xs bg-white"
                            value={parcel.category}
                            onChange={(e) => handleParcelChange(parcel.id!, 'category', e.target.value)}
                         >
                            {Object.values(ParcelCategory).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </td>
                      <td className="p-3 align-top">
                        <input type="number" min="1" className="w-full p-2 border border-slate-200 rounded text-center"
                          value={parcel.quantity}
                          onChange={(e) => handleParcelChange(parcel.id!, 'quantity', parseInt(e.target.value))}
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input type="number" min="0" step="0.1" className="w-full p-2 border border-slate-200 rounded text-center"
                          value={parcel.actualWeight}
                          onChange={(e) => handleParcelChange(parcel.id!, 'actualWeight', parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex gap-1 items-center">
                          <input type="number" placeholder="L" className="w-full p-2 border border-slate-200 rounded text-center" 
                             value={parcel.length || ''} onChange={(e) => handleParcelChange(parcel.id!, 'length', parseFloat(e.target.value))} />
                          <span className="text-slate-400">x</span>
                          <input type="number" placeholder="W" className="w-full p-2 border border-slate-200 rounded text-center" 
                             value={parcel.width || ''} onChange={(e) => handleParcelChange(parcel.id!, 'width', parseFloat(e.target.value))} />
                          <span className="text-slate-400">x</span>
                          <input type="number" placeholder="H" className="w-full p-2 border border-slate-200 rounded text-center" 
                             value={parcel.height || ''} onChange={(e) => handleParcelChange(parcel.id!, 'height', parseFloat(e.target.value))} />
                        </div>
                        <div className="text-xs text-slate-400 mt-1 text-center">Vol: {vol.toFixed(2)} kg</div>
                      </td>
                      <td className="p-3 text-right align-top font-mono font-medium text-slate-700">
                        {chargeable.toFixed(2)} kg
                      </td>
                      <td className="p-3 text-right align-top font-mono font-bold text-slate-900">
                        {price.toFixed(2)}
                      </td>
                      <td className="p-3 text-center align-top">
                        <button type="button" onClick={() => removeParcel(parcel.id!)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings & Prohibited */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm">
              <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" /> Prohibited Items
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 list-disc list-inside text-red-700">
                 {PROHIBITED_ITEMS.slice(0, 6).map((item, i) => (
                    <li key={i}>{item}</li>
                 ))}
              </ul>
           </div>
           
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                 <span>Subtotal</span>
                 <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                 <span>Taxes & Surcharges</span>
                 <span>${taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                 <span>Grand Total</span>
                 <span>SGD {grandTotal.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
           <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium">
             Cancel
           </button>
           <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center gap-2 shadow-lg shadow-blue-200">
             <Save className="w-4 h-4" /> Save & Generate Invoice
           </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
