import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import axios from 'axios';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    materials_provided_by: 'customer',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/customers', formData);
      onSuccess();
      onClose();
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        materials_provided_by: 'customer',
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
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Jane Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number *</label>
            <Input name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. +1 234 567 890" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Address</label>
            <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Boutique St" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Materials Provided By</label>
            <select
              name="materials_provided_by"
              value={formData.materials_provided_by}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
            >
              <option value="boutique">Boutique</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-zinc-50 border-b border-[#e5e0d8] dark:border-[#262626] pb-2">Body Measurements (inches)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Bust', name: 'measurements.bust' },
              { label: 'Waist', name: 'measurements.waist' },
              { label: 'Hip', name: 'measurements.hip' },
              { label: 'Shoulder', name: 'measurements.shoulder' },
              { label: 'Sleeve Length', name: 'measurements.sleeve_length' },
              { label: 'Top Length', name: 'measurements.top_length' },
              { label: 'Bottom Length', name: 'measurements.bottom_length' },
              { label: 'Neck', name: 'measurements.neck' },
              { label: 'Arm Round', name: 'measurements.arm_round' },
            ].map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{field.label}</label>
                <Input
                  type="number"
                  step="0.1"
                  name={field.name}
                  value={(formData.measurements as any)[field.name.split('.')[1]]}
                  onChange={handleChange}
                  placeholder="0.0"
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fitting Requirements</label>
            <textarea
              name="measurements.fitting_requirements"
              value={formData.measurements.fitting_requirements}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-[#e5e0d8] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] dark:focus-visible:ring-[#c19a6b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300"
              placeholder="e.g. Loose fit, Slim fit, Extra margin needed..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
