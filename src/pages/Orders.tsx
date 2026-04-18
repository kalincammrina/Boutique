import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, Calendar, X, Edit2, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Orders() {
  const [searchParams] = useSearchParams();
  const filterCustomerId = searchParams.get('customerId');

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    design_type: '',
    materials_provided_by: 'customer',
    trial_date: '',
    delivery_date: '',
    price_estimate: '',
    advance_paid: '',
    status: 'order_taken',
    notes: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrderId(order.id);
    setFormData({
      customer_id: order.customer_id.toString(),
      design_type: order.design_type || '',
      materials_provided_by: order.materials_provided_by || 'customer',
      trial_date: order.trial_date ? new Date(order.trial_date).toISOString().split('T')[0] : '',
      delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : '',
      price_estimate: order.price_estimate ? order.price_estimate.toString() : '',
      advance_paid: order.advance_paid ? order.advance_paid.toString() : '',
      status: order.status || 'order_taken',
      notes: order.notes || ''
    });
    setIsFormOpen(true);
    setTimeout(() => {
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenNewForm = () => {
    setSelectedOrderId(null);
    setFormData({
      customer_id: '',
      design_type: '',
      materials_provided_by: 'customer',
      trial_date: '',
      delivery_date: '',
      price_estimate: '',
      advance_paid: '',
      status: 'order_taken',
      notes: ''
    });
    setIsFormOpen(true);
    setTimeout(() => {
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price_estimate: formData.price_estimate ? parseFloat(formData.price_estimate) : 0,
        advance_paid: formData.advance_paid ? parseFloat(formData.advance_paid) : 0
      };

      if (selectedOrderId) {
        await axios.put(`/api/orders/${selectedOrderId}`, payload);
      } else {
        await axios.post('/api/orders', payload);
      }
      
      setIsFormOpen(false);
      setSelectedOrderId(null);
      setFormData({
        customer_id: '',
        design_type: '',
        materials_provided_by: 'customer',
        trial_date: '',
        delivery_date: '',
        price_estimate: '',
        advance_paid: '',
        status: 'order_taken',
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/api/orders/${orderId}`);
      fetchOrders();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const columns = [
    { id: 'order_taken', title: 'Order Taken' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'pending', title: 'Pending' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4">
      {filterCustomerId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Viewing Order History</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Showing all records for this customer</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/orders'} className="text-blue-600">View All Orders</Button>
        </div>
      )}

      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Orders Workflow</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[15px]">Manage tailoring orders through different stages.</p>
        </div>
        {!isFormOpen && (
          <div className="flex gap-2">
            {filterCustomerId && (
              <Button variant="outline" onClick={() => window.location.href = '/orders'} className="text-zinc-500">
                Clear Filter
              </Button>
            )}
            <Button onClick={handleOpenNewForm} className="gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          let colOrders = orders.filter((o: any) => o.status === col.id);
          
          if (filterCustomerId) {
            colOrders = colOrders.filter((o: any) => o.customer_id.toString() === filterCustomerId);
          } else {
            // Only apply the 5-day removal logic if NOT viewing history
            if (col.id === 'completed') {
              const fiveDaysAgo = new Date();
              fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
              colOrders = colOrders.filter((o: any) => {
                if (!o.completed_at) return true;
                return new Date(o.completed_at) > fiveDaysAgo;
              });
            }
          }

          return (
            <div key={col.id} className="bg-[#fdfbf7] dark:bg-[#141414] rounded-xl border border-[#e5e0d8] dark:border-[#262626] p-5 min-h-[600px] flex flex-col transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50">{col.title}</h2>
                <span className="bg-[#f9ede0] dark:bg-[#291d10] text-[#8B7355] dark:text-[#c19a6b] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  {loading ? '0' : colOrders.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {loading ? (
                  <div className="border-2 border-dashed border-[#e5e0d8] dark:border-[#262626] rounded-xl p-8 flex items-center justify-center text-zinc-400 text-sm">
                    Loading...
                  </div>
                ) : colOrders.length === 0 ? (
                  <div className="border-2 border-dashed border-[#e5e0d8] dark:border-[#262626] rounded-xl py-10 flex items-center justify-center text-zinc-400 text-sm">
                    No orders here
                  </div>
                ) : (
                  colOrders.map((order: any) => (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-[#e5e0d8] dark:border-[#262626] hover:border-[#8B7355] dark:hover:border-[#c19a6b] transition-colors relative group"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-[#8B7355] dark:hover:text-[#c19a6b]"
                            onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {openMenuId === order.id && (
                            <div className="absolute right-0 top-10 z-[100] w-32 bg-white dark:bg-[#1a1a1a] shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 animate-in fade-in zoom-in duration-200">
                              <button 
                                onClick={() => { handleEditOrder(order); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button 
                                onClick={() => { handleDeleteOrder(order.id); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      
                      {col.id === 'order_taken' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">#{order.id.toString().padStart(4, '0')}</span>
                            <span className="text-xs font-medium text-[#8B7355] dark:text-[#c19a6b] bg-[#f9ede0] dark:bg-[#291d10] px-2 py-1 rounded-md">
                              {order.design_type}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{order.customer_name}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                            <div>Order Date: {new Date(order.created_at).toLocaleDateString()}</div>
                            <div>Delivery: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</div>
                          </div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Amount: ₹{parseFloat(order.price_estimate).toFixed(2)}</div>
                          {order.notes && <p className="text-[10px] text-zinc-400 italic line-clamp-1">Notes: {order.notes}</p>}
                        </div>
                      ) : col.id === 'in_progress' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">#{order.id.toString().padStart(4, '0')}</span>
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{order.customer_name}</p>
                          </div>
                          <div className="bg-[#fdf8f3] dark:bg-[#26211c] p-3 rounded-lg border border-[#f9ede0] dark:border-[#3d3024]">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Dress Type</p>
                            <p className="text-lg font-serif font-bold text-[#8B7355] dark:text-[#c19a6b]">{order.design_type}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            <span>Delivery: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</span>
                          </div>
                        </div>
                      ) : col.id === 'pending' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">#{order.id.toString().padStart(4, '0')}</span>
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Pending</span>
                          </div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{order.customer_name}</p>
                          <p className="text-xs text-zinc-500">{order.design_type}</p>
                          <div className="text-[10px] text-zinc-400 mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded italic">
                            {order.notes || "Awaiting processing..."}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">#{order.id.toString().padStart(4, '0')}</span>
                            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Completed</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{order.customer_name}</p>
                            <p className="text-[11px] text-zinc-500">{order.customer_phone}</p>
                          </div>
                          <div className="bg-[#f7fcf8] dark:bg-[#1c261e] p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{order.design_type}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Amount: ₹{parseFloat(order.price_estimate).toFixed(2)}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-1 text-[10px] text-zinc-500">
                            <div>Completed: {order.completed_at ? new Date(order.completed_at).toLocaleDateString() : 'TBD'}</div>
                            <div>Delivered: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</div>
                          </div>
                          {order.notes && (
                            <div className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded italic">
                              Notes: {order.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="border-b border-[#e5e0d8] dark:border-[#262626] py-4"></div>

      {isFormOpen && (
        <Card id="order-form" className="border-[#e5e0d8] dark:border-[#262626] shadow-sm mb-8 animate-in slide-in-from-bottom duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{selectedOrderId ? 'Edit Order' : 'Add New Order'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Customer</label>
                  <select 
                    required 
                    name="customer_id" 
                    value={formData.customer_id} 
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Design Type</label>
                  <Input required name="design_type" value={formData.design_type} onChange={handleInputChange} placeholder="e.g. Wedding Suit, Evening Gown" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price Estimate ($)</label>
                  <Input type="number" step="0.01" name="price_estimate" value={formData.price_estimate} onChange={handleInputChange} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Advance Paid ($)</label>
                  <Input type="number" step="0.01" name="advance_paid" value={formData.advance_paid} onChange={handleInputChange} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Material Provided By</label>
                  <select 
                    name="materials_provided_by" 
                    value={formData.materials_provided_by} 
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                  >
                    <option value="customer">Customer</option>
                    <option value="boutique">Boutique</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                  >
                    <option value="order_taken">Order Taken</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Trial Date</label>
                  <Input type="date" name="trial_date" value={formData.trial_date} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Delivery Date</label>
                  <Input type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Special instructions..."
                  className="flex min-h-[80px] w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit">Save Order</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="border-b border-[#e5e0d8] dark:border-[#262626] pt-8"></div>
    </div>
  );
}
