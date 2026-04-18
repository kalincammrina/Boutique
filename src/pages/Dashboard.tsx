import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Users, ShoppingBag, CreditCard, Clock, Plus, UserPlus, UserCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerModal } from '../components/CustomerModal';
import { OrderModal } from '../components/OrderModal';
import { Modal } from '../components/Modal';
import { motion } from 'motion/react';

export default function Dashboard() {
  const isDark = true;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    returningCustomers: 0,
    ordersInProgress: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ]);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, ordersRes, paymentsRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/orders'),
        axios.get('/api/payments')
      ]);
      
      const customers = customersRes.data;
      const orders = ordersRes.data;
      const payments = paymentsRes.data;
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newCustomersThisMonth = customers.filter((c: any) => {
        const created = new Date(c.created_at);
        return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
      }).length;

      const returningCustomers = customers.filter((c: any) => c.order_count > 1).length;
      const ordersInProgress = orders.filter((o: any) => o.status === 'in_progress' || o.status === 'pending' || o.status === 'ready_for_trial').length;
      const pendingPayments = payments.filter((p: any) => p.payment_status !== 'paid').length;
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + parseFloat(p.advance_paid), 0);
      
      setStats({
        totalCustomers: customers.length,
        newCustomersThisMonth,
        returningCustomers,
        ordersInProgress,
        pendingPayments,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    { label: 'Add New Customer', icon: UserPlus, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', onClick: () => setIsCustomerModalOpen(true) },
    { label: 'Add Order (Existing)', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', onClick: () => setIsOrderModalOpen(true) },
    { label: 'View Regulars', icon: UserCheck, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', onClick: () => navigate('/customers') },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Boutique Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsChoiceModalOpen(true)} className="gap-2 shadow-lg shadow-[#8B7355]/20 dark:shadow-none">
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#8B7355] dark:hover:border-[#c19a6b] transition-all duration-200 shadow-sm"
          >
            <div className={`p-3 rounded-xl mb-3 ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 text-center uppercase tracking-wider">{action.label}</span>
          </motion.button>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-[#8B7355] dark:text-[#c19a6b]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.totalCustomers}</div>
            <div className="flex items-center mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% growth</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">New (This Month)</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.newCustomersThisMonth}</div>
            <p className="text-xs text-zinc-500 mt-1">First-time clients</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Returning</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.returningCustomers}</div>
            <p className="text-xs text-zinc-500 mt-1">Loyal customers</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.ordersInProgress}</div>
            <p className="text-xs text-zinc-500 mt-1">Active tailoring</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.pendingPayments}</div>
            <p className="text-xs text-zinc-500 mt-1">Awaiting balance</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        <Card className="col-span-1 border-none shadow-sm bg-white dark:bg-[#141414]">
          <CardHeader>
            <CardTitle className="font-serif">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#e5e0d8'} />
                  <XAxis dataKey="name" stroke={isDark ? '#a3a3a3' : '#71717a'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#a3a3a3' : '#71717a'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: isDark ? '#262626' : '#fdf8f3'}} 
                    contentStyle={{
                      borderRadius: '12px', 
                      border: `1px solid ${isDark ? '#262626' : '#e5e0d8'}`,
                      backgroundColor: isDark ? '#141414' : '#ffffff',
                      color: isDark ? '#f5f2ed' : '#1a1a1a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="revenue" fill={isDark ? '#c19a6b' : '#8B7355'} radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
      <OrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
      
      {/* Choice Modal */}
      <Modal isOpen={isChoiceModalOpen} onClose={() => setIsChoiceModalOpen(false)} title="New Request">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          <Button 
            className="h-32 flex flex-col gap-3 text-lg font-serif" 
            onClick={() => {
              setIsChoiceModalOpen(false);
              setIsOrderModalOpen(true);
            }}
          >
            <Search className="h-8 w-8" />
            Search Existing Customer
          </Button>
          <Button 
            variant="outline"
            className="h-32 flex flex-col gap-3 text-lg font-serif" 
            onClick={() => {
              setIsChoiceModalOpen(false);
              setIsCustomerModalOpen(true);
            }}
          >
            <UserPlus className="h-8 w-8" />
            Add New Customer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

