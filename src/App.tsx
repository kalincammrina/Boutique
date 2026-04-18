/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="flex h-screen w-full bg-[#fdfbf7] dark:bg-[#0a0a0a] font-sans text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers/*" element={<Customers />} />
            <Route path="/orders/*" element={<Orders />} />
            <Route path="/inventory/*" element={<Inventory />} />
            <Route path="/billing/*" element={<Billing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
