import { Link, useLocation } from 'react-router-dom';
import { Scissors, LayoutDashboard, Users, ShoppingBag, CreditCard, Package } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Billing', path: '/billing', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#141414] transition-colors duration-300">
      <div className="flex h-16 items-center justify-between border-b border-[#e5e0d8] dark:border-[#262626] px-6">
        <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-zinc-900 dark:text-zinc-50">
          <Scissors className="h-5 w-5 text-[#8B7355] dark:text-[#c19a6b]" />
          <span>Noolini Studio</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#f9ede0] dark:bg-[#291d10] text-[#8B7355] dark:text-[#c19a6b]"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-[#8B7355] dark:text-[#c19a6b]" : "text-zinc-400 dark:text-zinc-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
