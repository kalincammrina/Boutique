import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    fabric_name: '',
    fabric_id: '',
    stock_quantity: '',
    reorder_level: '',
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/inventory/${editingId}`, formData);
      } else {
        await axios.post('/api/inventory', formData);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ fabric_name: '', fabric_id: '', stock_quantity: '', reorder_level: '' });
      setSearchQuery('');
      fetchInventory();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      fabric_name: item.fabric_name,
      fabric_id: item.fabric_id || item.color || '',
      stock_quantity: item.stock_quantity.toString(),
      reorder_level: item.reorder_level.toString()
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    // Using a simple custom confirmation approach without window.confirm
    try {
      await axios.delete(`/api/inventory/${id}`);
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const openNewForm = () => {
    setFormData({ fabric_name: '', fabric_id: '', stock_quantity: '', reorder_level: '' });
    setEditingId(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (isFormOpen) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isFormOpen]);

  const filteredInventory = inventory.filter((item: any) => 
    item.fabric_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.fabric_id && item.fabric_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-serif">Fabric Inventory</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage fabric stock, suppliers, and reorder levels.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={openNewForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Fabric
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Inventory List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                type="search"
                placeholder="Search fabrics..."
                className="pl-8 bg-zinc-50 dark:bg-zinc-900/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
              <thead className="text-xs text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Fabric Name</th>
                  <th scope="col" className="px-6 py-3 font-medium">Fabric ID</th>
                  <th scope="col" className="px-6 py-3 font-medium">Stock (m)</th>
                  <th scope="col" className="px-6 py-3 font-medium">Status</th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading inventory...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      {searchQuery ? "No matching fabrics found." : "No fabrics in inventory."}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item: any) => {
                    const isLowStock = parseFloat(item.stock_quantity) < 10;

                    return (
                      <tr key={item.id} className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{item.fabric_name}</td>
                        <td className="px-6 py-4">{item.fabric_id || item.color}</td>
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                          {item.stock_quantity}
                        </td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                              <AlertCircle className="h-3 w-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                <CardTitle>{editingId ? 'Edit Fabric' : 'Add New Fabric'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="text-zinc-500 dark:text-zinc-400">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fabric Name</label>
                      <Input required name="fabric_name" value={formData.fabric_name} onChange={handleInputChange} placeholder="e.g. Premium Silk" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fabric ID</label>
                      <Input required name="fabric_id" value={formData.fabric_id} onChange={handleInputChange} placeholder="e.g. SILK-001" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Stock Quantity (meters)</label>
                      <Input required type="number" step="0.1" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} placeholder="0.0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reorder Level</label>
                      <Input required type="number" step="0.1" name="reorder_level" value={formData.reorder_level} onChange={handleInputChange} placeholder="5.0" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingId ? 'Update Fabric' : 'Save Fabric'}</Button>
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
