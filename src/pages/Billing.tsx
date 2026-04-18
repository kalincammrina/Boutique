import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, MoreHorizontal, DollarSign, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Billing() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | ''>('');
  const formRef = useRef<HTMLDivElement>(null);
  const [paymentData, setPaymentData] = useState({
    amount_paid: '',
    discount_amount: '0',
    payment_mode: 'Cash',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments');
      const paymentsWithMemberships = await Promise.all(res.data.map(async (p: any) => {
        if (!p.customer_id) {
          return { ...p, customer_membership: null };
        }
        try {
          const custRes = await axios.get(`/api/customers/${p.customer_id}`);
          return { ...p, customer_membership: custRes.data };
        } catch (err) {
          console.error(`Failed to fetch membership for customer ${p.customer_id}:`, err);
          return { ...p, customer_membership: null };
        }
      }));
      setPayments(paymentsWithMemberships);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (isFormOpen) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isFormOpen]);

  const getPaymentStatusDisplay = (payment: any) => {
    const status = payment.payment_status;
    const remaining = parseFloat(payment.remaining_amount || 0);

    if (status === 'paid' || remaining <= 0) {
      return (
        <span className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium border">
          Paid
        </span>
      );
    }
    
    return (
      <span className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium border">
        ₹{remaining.toFixed(2)} Pending
      </span>
    );
  };

  const handleRecordPayment = (paymentId?: number) => {
    setSelectedPaymentId(paymentId || '');
    setPaymentData({ 
      amount_paid: '', 
      discount_amount: '0',
      payment_mode: 'Cash',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setIsFormOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    const paymentToUpdate = payments.find((p: any) => p.id === Number(selectedPaymentId));
    if (!paymentToUpdate) return;

    const originalAmount = parseFloat(paymentToUpdate.price_estimate || '0');
    const customer = paymentToUpdate.customer_membership || {};
    const membershipPlan = customer.membership_plan || 'None';
    const discountPercent = customer.membership_discount || 0;
    
    const discountAmount = (originalAmount * discountPercent) / 100;
    const finalAmount = originalAmount - discountAmount;
    
    const paid_now = parseFloat(paymentData.amount_paid || '0');
    const currentAdvance = parseFloat(paymentToUpdate.advance_paid || 0);
    const totalPaid = currentAdvance + paid_now;
    
    const newRemaining = Math.max(0, finalAmount - totalPaid);
    
    let newStatus = 'partial';
    if (newRemaining <= 0) {
      newStatus = 'paid';
    } else if (totalPaid === 0) {
      newStatus = 'unpaid';
    }

    try {
      await axios.put(`/api/payments/${selectedPaymentId}`, {
        advance_paid: totalPaid,
        discount: discountPercent,
        discount_amount: discountAmount,
        original_amount: originalAmount,
        final_amount: finalAmount,
        remaining_amount: newRemaining,
        payment_status: newStatus,
        payment_mode: paymentData.payment_mode,
        payment_date: paymentData.payment_date,
        membership_plan: membershipPlan
      });
      setIsFormOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const selectedPaymentDetails = payments.find((p: any) => p.id === Number(selectedPaymentId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-serif">Billing & Payments</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Track estimates, advances, and remaining balances.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => handleRecordPayment()} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-8 bg-zinc-50 dark:bg-zinc-900/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
              <thead className="text-xs text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Order ID</th>
                  <th scope="col" className="px-6 py-3 font-medium w-[280px]">Customer</th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">Amount</th>
                  <th scope="col" className="px-6 py-3 font-medium">Discount</th>
                  <th scope="col" className="px-6 py-3 font-medium">Status</th>
                  <th scope="col" className="px-6 py-3 font-medium text-right font-bold w-[160px]">Final Amount</th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">Loading payments...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">No payments found.</td>
                  </tr>
                ) : (
                  payments.map((payment: any) => (
                    <tr key={payment.id} className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">#{payment.order_id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4 w-[280px]">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-zinc-50 font-semibold">{payment.customer_name}</span>
                          {payment.customer_membership?.membership_plan && payment.customer_membership.membership_plan !== 'None' && (
                            <span className="text-[10px] text-purple-600 font-bold uppercase">{payment.customer_membership.membership_plan} Plan</span>
                          )}
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">{payment.design_type || payment.dress_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500">₹{parseFloat(payment.price_estimate).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">₹{parseFloat(payment.discount_amount || 0).toFixed(2)}</span>
                          {payment.discount > 0 && <span className="text-[10px] text-zinc-400">({payment.discount}%)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getPaymentStatusDisplay(payment)}</td>
                      <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-zinc-50 w-[160px] text-base">₹{parseFloat(payment.final_amount || payment.price_estimate).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        {payment.payment_status !== 'paid' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRecordPayment(payment.id)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
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
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{selectedPaymentId !== '' ? `Pay - Order #${(payments.find((p: any) => p.id === selectedPaymentId) as any)?.order_id.toString().padStart(4, '0')}` : 'Record New Payment'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="text-zinc-500 dark:text-zinc-400">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedPaymentId === '' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Order</label>
                        <select 
                          required 
                          value={selectedPaymentId} 
                          onChange={(e) => setSelectedPaymentId(e.target.value ? Number(e.target.value) : '')}
                          className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-50"
                        >
                          <option value="">Select an unpaid order...</option>
                          {payments.filter((p: any) => p.payment_status !== 'paid').map((p: any) => (
                            <option key={p.id} value={p.id}>
                              Order #{p.order_id.toString().padStart(4, '0')} - {p.customer_name} (Bal: ₹{parseFloat(p.remaining_amount).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedPaymentDetails && (
                      <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{selectedPaymentDetails.customer_name}</p>
                            <p className="text-[10px] text-zinc-400">Membership: {selectedPaymentDetails.customer_membership?.membership_plan || 'None'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Amount</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">₹{parseFloat(selectedPaymentDetails.price_estimate).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Discount</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {selectedPaymentDetails.customer_membership?.membership_plan !== 'None' ? 
                                `${selectedPaymentDetails.customer_membership?.membership_plan} - ${selectedPaymentDetails.customer_membership?.membership_discount}% = ₹${(parseFloat(selectedPaymentDetails.price_estimate) * (selectedPaymentDetails.customer_membership?.membership_discount || 0) / 100).toFixed(2)}` 
                                : 'None'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Final Amount</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ₹{(parseFloat(selectedPaymentDetails.price_estimate) * (1 - (selectedPaymentDetails.customer_membership?.membership_discount || 0) / 100)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount Paid (₹) *</label>
                          <Input 
                            required 
                            type="number" 
                            step="0.01" 
                            min="0"
                            value={paymentData.amount_paid} 
                            onChange={(e) => setPaymentData(prev => ({ ...prev, amount_paid: e.target.value }))} 
                            placeholder="Enter amount customer is paying now" 
                            disabled={selectedPaymentId === '' && !selectedPaymentDetails}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mode of Payment</label>
                          <select 
                            required 
                            value={paymentData.payment_mode} 
                            onChange={(e) => setPaymentData(prev => ({ ...prev, payment_mode: e.target.value }))}
                            className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-50"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Net Banking">Net Banking</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                        <div>
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Summary</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Payable: ₹{(parseFloat(selectedPaymentDetails?.price_estimate || 0) * (1 - (selectedPaymentDetails?.customer_membership?.membership_discount || 0) / 100)).toFixed(2)}</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Paid: ₹{(parseFloat(selectedPaymentDetails?.advance_paid || 0) + (parseFloat(paymentData.amount_paid) || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Remaining Balance</p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            ₹{Math.max(0, (parseFloat(selectedPaymentDetails?.price_estimate || 0) * (1 - (selectedPaymentDetails?.customer_membership?.membership_discount || 0) / 100)) - (parseFloat(selectedPaymentDetails?.advance_paid || 0) + (parseFloat(paymentData.amount_paid) || 0))).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={(selectedPaymentId === '' && !selectedPaymentDetails) || !paymentData.amount_paid}>Save Payment</Button>
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
