import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Search, User, History, Ruler } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Customer, 2: Create Order
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [orderData, setOrderData] = useState({
    design_type: '',
    delivery_date: '',
    materials_provided_by: 'customer',
    price_estimate: '',
    advance_paid: '',
    notes: '',
    status: 'order_taken'
  });

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchCustomers();
    }
  }, [isOpen, step]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSelectCustomer = async (customer: any) => {
    try {
      const res = await axios.get(`/api/customers/${customer.id}`);
      setSelectedCustomer(res.data);
      setStep(2);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/orders', {
        ...orderData,
        customer_id: selectedCustomer.id
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSearchQuery('');
    setOrderData({
      design_type: '',
      delivery_date: '',
      materials_provided_by: 'customer',
      price_estimate: '',
      advance_paid: '',
      notes: '',
      status: 'order_taken'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Select Customer" : "Add New Order"}>
      {step === 1 ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              className="pl-10"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[#e5e0d8] dark:border-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{customer.name}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{customer.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[#8B7355] dark:text-[#c19a6b]">
                    {customer.order_count > 1 ? 'Regular' : 'New'}
                  </div>
                  <div className="text-xs text-zinc-400">{customer.order_count} Orders</div>
                </div>
              </button>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-zinc-500">No customers found.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Summary */}
          <div className="bg-[#fdf8f3] dark:bg-[#1a1a1a] rounded-xl p-4 border border-[#f9ede0] dark:border-[#291d10] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#8B7355] dark:text-[#c19a6b]">
                <User className="h-4 w-4" />
                Customer Info
              </div>
              <div className="text-lg font-serif font-bold text-zinc-900 dark:text-zinc-50">{selectedCustomer.name}</div>
              <div className="text-sm text-zinc-500">{selectedCustomer.phone}</div>
              <div className="flex gap-2">
                <span className={selectedCustomer.order_count > 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"}>
                  {selectedCustomer.order_count > 1 ? 'Regular' : 'New'}
                </span>
                <span className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Orders: {selectedCustomer.order_count}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#8B7355] dark:text-[#c19a6b]">
                <Ruler className="h-4 w-4" />
                Saved Measurements
              </div>
              {selectedCustomer.measurements ? (
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
                  <div className="text-zinc-500">Bust: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{selectedCustomer.measurements.bust || '-'}</span></div>
                  <div className="text-zinc-500">Waist: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{selectedCustomer.measurements.waist || '-'}</span></div>
                  <div className="text-zinc-500">Hip: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{selectedCustomer.measurements.hip || '-'}</span></div>
                  <div className="text-zinc-500">Shoulder: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{selectedCustomer.measurements.shoulder || '-'}</span></div>
                  <div className="text-zinc-500">Sleeve: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{selectedCustomer.measurements.sleeve_length || '-'}</span></div>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 italic">No measurements saved.</div>
              )}
              {selectedCustomer.measurements?.fitting_requirements && (
                <div className="text-[11px] text-zinc-500 mt-1">
                  <span className="font-medium text-[#8B7355]">Fitting:</span> {selectedCustomer.measurements.fitting_requirements}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Design Type *</label>
                <Input name="design_type" value={orderData.design_type} onChange={handleOrderChange} required placeholder="e.g. Evening Gown" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Delivery Date</label>
                <Input name="delivery_date" type="date" value={orderData.delivery_date} onChange={handleOrderChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Materials Provided By</label>
                <select
                  name="materials_provided_by"
                  value={orderData.materials_provided_by}
                  onChange={handleOrderChange}
                  className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] transition-colors"
                >
                  <option value="customer">Customer</option>
                  <option value="boutique">Boutique</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price Estimate</label>
                <Input name="price_estimate" type="number" value={orderData.price_estimate} onChange={handleOrderChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Advance Paid</label>
                <Input name="advance_paid" type="number" value={orderData.advance_paid} onChange={handleOrderChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select
                  name="status"
                  value={orderData.status}
                  onChange={handleOrderChange}
                  className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] transition-colors"
                >
                  <option value="order_taken">Order Taken</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes / Special Instructions</label>
              <textarea
                name="notes"
                value={orderData.notes}
                onChange={handleOrderChange}
                className="flex min-h-[80px] w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] transition-colors"
                placeholder="Any specific design details or fitting requests..."
              />
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back to Search</Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
