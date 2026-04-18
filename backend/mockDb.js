
// Shared mock state for development mode without a database
export const mockData = {
  customers: [
    { 
      id: 1, name: 'Alice Smith', phone: '555-0101', email: 'alice@example.com', address: '123 Main St', 
      created_at: '2026-03-01T10:00:00Z', materials_provided_by: 'boutique',
      membership_plan: 'Gold', membership_discount: 10, membership_start_date: '2026-03-01', membership_expiry_date: '2027-03-01', membership_status: 'Active'
    },
    { 
      id: 2, name: 'Bob Johnson', phone: '555-0102', email: 'bob@example.com', address: '456 Oak Ave', 
      created_at: '2026-03-15T11:00:00Z', materials_provided_by: 'customer',
      membership_plan: 'None', membership_discount: 0, membership_start_date: null, membership_expiry_date: null, membership_status: null
    }
  ],
  orders: [
    { id: 1, customer_id: 1, design_type: 'Evening Gown', materials_provided_by: 'boutique', trial_date: '2026-04-01', delivery_date: '2026-04-10', price_estimate: 450.00, advance_paid: 200, status: 'in_progress', created_at: '2026-03-20T09:00:00Z', notes: 'Extra padding' },
    { id: 2, customer_id: 2, design_type: 'Two-Piece Suit', materials_provided_by: 'customer', trial_date: '2026-03-25', delivery_date: '2026-04-05', price_estimate: 800.00, advance_paid: 400, status: 'order_taken', created_at: '2026-03-22T14:00:00Z', notes: 'Slim fit cut' },
    { id: 3, customer_id: 1, design_type: 'Summer Dress', materials_provided_by: 'boutique', trial_date: '2026-04-10', delivery_date: '2026-04-15', price_estimate: 150.00, advance_paid: 150, status: 'completed', created_at: '2026-04-10T10:00:00Z', completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Customer loved it' },
    { id: 4, customer_id: 2, design_type: 'Winter Coat', materials_provided_by: 'customer', trial_date: '2026-03-20', delivery_date: '2026-03-28', price_estimate: 600.00, advance_paid: 600, status: 'completed', created_at: '2026-03-20T10:00:00Z', completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Old completion' }
  ],
  payments: [
    { id: 1, order_id: 1, advance_paid: 200, discount: 0, discount_amount: 0, remaining_amount: 250, payment_status: 'partial', original_amount: 450, final_amount: 450, payment_mode: 'Cash', payment_date: '2026-03-20' },
    { id: 2, order_id: 2, advance_paid: 400, discount: 0, discount_amount: 0, remaining_amount: 400, payment_status: 'partial', original_amount: 800, final_amount: 800, payment_mode: 'UPI', payment_date: '2026-03-23' },
    { id: 3, order_id: 3, advance_paid: 150, discount: 10, discount_amount: 15, remaining_amount: 0, payment_status: 'paid', original_amount: 150, final_amount: 135, payment_mode: 'Card', payment_date: '2026-04-15' },
    { id: 4, order_id: 4, advance_paid: 600, discount: 0, discount_amount: 0, remaining_amount: 0, payment_status: 'paid', original_amount: 600, final_amount: 600, payment_mode: 'Net Banking', payment_date: '2026-03-28' }
  ],
  measurements: [
    { id: 1, customer_id: 1, bust: 36, waist: 28, hip: 38, shoulder: 15, sleeve_length: 22, fitting_requirements: 'Standard fit' },
    { id: 2, customer_id: 2, bust: 40, waist: 34, hip: 42, shoulder: 18, sleeve_length: 24, fitting_requirements: 'Athletic cut' }
  ],
  inventory: [
    { id: 1, fabric_name: 'Premium Silk', fabric_id: 'SILK-001', stock_quantity: 45.5, reorder_level: 10, created_at: '2026-03-01T10:00:00Z' },
    { id: 2, fabric_name: 'Cotton Blend', fabric_id: 'COT-002', stock_quantity: 120.0, reorder_level: 20, created_at: '2026-03-05T11:00:00Z' },
    { id: 3, fabric_name: 'Italian Wool', fabric_id: 'WOOL-003', stock_quantity: 8.0, reorder_level: 5.0, created_at: '2026-03-10T14:00:00Z' }
  ]
};
