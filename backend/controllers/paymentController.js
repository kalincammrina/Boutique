import { getDb } from '../config/db.js';
import { mockData } from '../mockDb.js';

export const getAllPayments = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      // Enrich mock payments with order and customer info
      const enrichedPayments = mockData.payments.map(p => {
        const order = mockData.orders.find(o => o.id === p.order_id);
        const customer = order ? mockData.customers.find(c => c.id === order.customer_id) : null;
        return {
          ...p,
          customer_id: customer ? customer.id : null,
          design_type: order ? order.design_type : 'Unknown',
          price_estimate: order ? order.price_estimate : 0,
          customer_name: customer ? customer.name : 'Unknown'
        };
      });
      return res.json(enrichedPayments);
    }
    
    const [rows] = await db.query(`
      SELECT p.*, o.price_estimate, o.design_type, o.customer_id, c.name as customer_name 
      FROM Payments p 
      JOIN Orders o ON p.order_id = o.id 
      JOIN Customers c ON o.customer_id = c.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { 
      advance_paid, discount_amount, remaining_amount, payment_status, 
      payment_mode, payment_date, membership_plan, discount, original_amount, final_amount 
    } = req.body;
    const db = await getDb();
    
    if (!db) {
      const index = mockData.payments.findIndex(p => p.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      mockData.payments[index] = { 
        ...mockData.payments[index], 
        advance_paid, 
        discount_amount: discount_amount || 0,
        remaining_amount, 
        payment_status,
        payment_mode: payment_mode || 'Cash',
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        membership_plan: membership_plan || 'None',
        discount: discount || 0,
        original_amount: original_amount || 0,
        final_amount: final_amount || 0
      };
      return res.json(mockData.payments[index]);
    }
    
    await db.query(
      'UPDATE Payments SET advance_paid = ?, discount_amount = ?, remaining_amount = ?, payment_status = ?, payment_mode = ?, payment_date = ?, membership_plan = ?, discount = ?, original_amount = ?, final_amount = ? WHERE id = ?',
      [
        advance_paid, discount_amount || 0, remaining_amount, payment_status, 
        payment_mode || 'Cash', payment_date || null, membership_plan || 'None', 
        discount || 0, original_amount || 0, final_amount || 0, req.params.id
      ]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};
