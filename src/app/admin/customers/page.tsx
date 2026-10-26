'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Users, Search, Plus, Mail, Phone, MapPin, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customerType: 'RETAIL' as any,
    city: 'Jakarta',
    notes: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCustomers();
        setFormData({ firstName: '', lastName: '', email: '', phone: '', customerType: 'RETAIL', city: 'Jakarta', notes: '' });
      }
    } catch (e) {
      alert('Failed to create customer');
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Client Relations</span>
          <h1 className="text-2xl font-black text-[#14191F]">Customer Directory</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Profiles of retail buyers, interior designer partners, and character collectors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer Profile</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC]">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Client Type</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">Orders Count</th>
                <th className="px-6 py-3.5 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#14191F]">
                    {c.firstName} {c.lastName}
                    {c.notes && (
                      <p className="text-[10px] text-[#7A8B99] font-normal line-clamp-1">{c.notes}</p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489]">
                      {c.customerType.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {c.city || 'Jakarta'}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-[#14191F]">{c.email}</p>
                    <p className="text-[11px] text-[#7A8B99]">{c.phone || '-'}</p>
                  </td>

                  <td className="px-6 py-4 font-semibold text-[#14191F]">
                    {c.ordersCount} orders
                  </td>

                  <td className="px-6 py-4 text-right font-black text-[#14191F]">
                    {formatRupiah(c.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center text-[#7A8B99]">
              No customer profiles found.
            </div>
          )}
        </div>

      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ECE6DC]">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#14191F]">Add Customer Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#7A8B99] hover:text-[#14191F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Client Category</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  >
                    <option value="RETAIL">Retail Customer</option>
                    <option value="INTERIOR_DESIGNER">Interior Designer</option>
                    <option value="COLLECTOR">Art & Chibi Collector</option>
                    <option value="STUDIO_PARTNER">Studio Partner / B2B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Studio Notes & Preferences</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Preferred matte finishes, bespoke color requests..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#7A8B99] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
