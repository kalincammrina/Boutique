import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, MoreVertical, X, Ruler, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    materials_provided_by: 'customer',
    membership_plan: 'None',
    membership_discount: 0,
    membership_start_date: '',
    membership_expiry_date: '',
    membership_status: '',
    measurements: {
      bust: '',
      waist: '',
      hip: '',
      shoulder: '',
      sleeve_length: '',
      top_length: '',
      bottom_length: '',
      neck: '',
      arm_round: '',
      fitting_requirements: ''
    }
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'membership_plan') {
      let discount = 0;
      let status = '';
      let startDate = '';
      let expiryDate = '';

      if (value === 'Silver') {
        discount = 5;
        status = 'Active';
        startDate = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        expiryDate = nextYear.toISOString().split('T')[0];
      } else if (value === 'Gold') {
        discount = 10;
        status = 'Active';
        startDate = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        expiryDate = nextYear.toISOString().split('T')[0];
      } else {
        discount = 0;
        status = '';
        startDate = '';
        expiryDate = '';
      }

      setFormData(prev => ({
        ...prev,
        membership_plan: value,
        membership_discount: discount,
        membership_status: status,
        membership_start_date: startDate,
        membership_expiry_date: expiryDate
      }));
      return;
    }

    const measurementFields = ['bust', 'waist', 'hip', 'shoulder', 'sleeve_length', 'top_length', 'bottom_length', 'neck', 'arm_round', 'fitting_requirements'];
    if (measurementFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/customers/${editingId}`, formData);
      } else {
        await axios.post('/api/customers', formData);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ 
        name: '', phone: '', email: '', address: '', materials_provided_by: 'customer',
        measurements: { bust: '', waist: '', hip: '', shoulder: '', sleeve_length: '', top_length: '', bottom_length: '', neck: '', arm_round: '', fitting_requirements: '' }
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      materials_provided_by: customer.materials_provided_by || 'customer',
      membership_plan: customer.membership_plan || 'None',
      membership_discount: customer.membership_discount || 0,
      membership_start_date: customer.membership_start_date ? new Date(customer.membership_start_date).toISOString().split('T')[0] : '',
      membership_expiry_date: customer.membership_expiry_date ? new Date(customer.membership_expiry_date).toISOString().split('T')[0] : '',
      membership_status: customer.membership_status || '',
      measurements: customer.measurements || {
        bust: '', waist: '', hip: '', shoulder: '', sleeve_length: '', top_length: '', bottom_length: '', neck: '', arm_round: '', fitting_requirements: ''
      }
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const openNewCustomerForm = () => {
    setEditingId(null);
    setFormData({ 
      name: '', phone: '', email: '', address: '', materials_provided_by: 'customer',
      membership_plan: 'None', membership_discount: 0, membership_start_date: '',
      membership_expiry_date: '', membership_status: '',
      measurements: { bust: '', waist: '', hip: '', shoulder: '', sleeve_length: '', top_length: '', bottom_length: '', neck: '', arm_round: '', fitting_requirements: '' }
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (isFormOpen) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isFormOpen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your clients and their measurements.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={openNewCustomerForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Customers</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 bg-zinc-50 dark:bg-[#141414]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#e5e0d8] dark:border-[#262626]">
            <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
              <thead className="text-xs text-zinc-700 dark:text-zinc-300 uppercase bg-[#fdfbf7] dark:bg-[#1a1a1a] border-b border-[#e5e0d8] dark:border-[#262626]">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium rounded-tl-md">Name</th>
                  <th scope="col" className="px-6 py-3 font-medium">Phone</th>
                  <th scope="col" className="px-6 py-3 font-medium">Type</th>
                  <th scope="col" className="px-6 py-3 font-medium text-center">History</th>
                  <th scope="col" className="px-6 py-3 font-medium text-right rounded-tr-md">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((customer: any, index: number) => (
                    <tr key={customer.id} className="bg-white dark:bg-[#141414] border-b border-[#e5e0d8] dark:border-[#262626] hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors last:border-0">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{customer.name}</div>
                        <div className="text-xs text-zinc-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4">{customer.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={customer.order_count > 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit"}>
                            {customer.order_count > 1 ? 'Regular' : 'New'}
                          </span>
                          {customer.membership_plan && customer.membership_plan !== 'None' && (
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit">
                              {customer.membership_plan} Member
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/orders?customerId=${customer.id}`)}
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 gap-1"
                        >
                          <History className="h-4 w-4" />
                          History
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          {openMenuId === customer.id && (
                            <div className={cn(
                              "absolute right-6 z-50 w-32 bg-white dark:bg-[#1a1a1a] shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 animate-in fade-in zoom-in duration-200",
                              index === customers.length - 1 && customers.length > 1 ? "bottom-12" : "top-12"
                            )}>
                              <button 
                                onClick={() => { handleEdit(customer); setOpenMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => { handleDelete(customer.id); setOpenMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            ref={formRef}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <Card className="border-[#e5e0d8] dark:border-[#262626] shadow-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setIsFormOpen(false); setEditingId(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 border-b border-[#e5e0d8] dark:border-[#262626] pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name *</label>
                        <Input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Jane Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number *</label>
                        <Input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 890" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="jane@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Address</label>
                        <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Materials Provided By</label>
                        <select
                          name="materials_provided_by"
                          value={formData.materials_provided_by}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                        >
                          <option value="boutique">Boutique</option>
                          <option value="customer">Customer</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Membership Plan</label>
                        <select
                          name="membership_plan"
                          value={formData.membership_plan}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                        >
                          <option value="None">None</option>
                          <option value="Silver">Silver (5% Discount)</option>
                          <option value="Gold">Gold (10% Discount)</option>
                        </select>
                      </div>
                      {formData.membership_plan !== 'None' && (
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">Membership Info</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{formData.membership_plan} Plan - {formData.membership_discount}% Discount</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">Valid Until</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{formData.membership_expiry_date}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 border-b border-[#e5e0d8] dark:border-[#262626] pb-2 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-[#8B7355] dark:text-[#c19a6b]" />
                      Measurements (inches)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bust</label>
                        <Input type="number" step="0.1" name="bust" value={formData.measurements.bust} onChange={handleInputChange} placeholder="36.5" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Waist</label>
                        <Input type="number" step="0.1" name="waist" value={formData.measurements.waist} onChange={handleInputChange} placeholder="28.0" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Hip</label>
                        <Input type="number" step="0.1" name="hip" value={formData.measurements.hip} onChange={handleInputChange} placeholder="38.0" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Shoulder</label>
                        <Input type="number" step="0.1" name="shoulder" value={formData.measurements.shoulder} onChange={handleInputChange} placeholder="15.0" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sleeve Length</label>
                        <Input type="number" step="0.1" name="sleeve_length" value={formData.measurements.sleeve_length} onChange={handleInputChange} placeholder="24.0" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fitting Requirements</label>
                      <textarea 
                        name="fitting_requirements" 
                        value={formData.measurements.fitting_requirements} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Loose fit, Slim fit, Extra margin needed..."
                        className="flex min-h-[80px] w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Customer</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
