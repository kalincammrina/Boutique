import { getDb } from '../config/db.js';
import { mockData } from '../mockDb.js';

export const getAllOrders = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const ordersWithNames = mockData.orders.map(o => {
        const customer = mockData.customers.find(c => c.id === o.customer_id);
        return { 
          ...o, 
          customer_name: customer ? customer.name : 'Unknown',
          customer_phone: customer ? customer.phone : ''
        };
      });
      return res.json(ordersWithNames);
    }
    
    const [rows] = await db.query(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM Orders o 
      JOIN Customers c ON o.customer_id = c.id 
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const order = mockData.orders.find(o => o.id === parseInt(req.params.id));
      if (!order) return res.status(404).json({ error: 'Not found' });
      const customer = mockData.customers.find(c => c.id === order.customer_id);
      return res.json({ 
        ...order, 
        customer_name: customer ? customer.name : 'Unknown',
        customer_phone: customer ? customer.phone : ''
      });
    }
    
    const [rows] = await db.query(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM Orders o 
      JOIN Customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, advance_paid, status, notes } = req.body;
    const db = await getDb();
    
    if (!db) {
      const customer = mockData.customers.find(c => c.id === parseInt(customer_id));
      const newOrder = { 
        id: mockData.orders.length > 0 ? Math.max(...mockData.orders.map(o => o.id)) + 1 : 1, 
        customer_id: parseInt(customer_id), 
        customer_name: customer ? customer.name : 'Mock Customer',
        customer_phone: customer ? customer.phone : '',
        design_type, 
        materials_provided_by, 
        trial_date, 
        delivery_date, 
        price_estimate: parseFloat(price_estimate) || 0, 
        advance_paid: parseFloat(advance_paid) || 0,
        status: status || 'order_taken',
        notes,
        created_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };
      mockData.orders.push(newOrder);
      mockData.payments.push({
        id: mockData.payments.length + 1,
        order_id: newOrder.id,
        advance_paid: newOrder.advance_paid,
        remaining_amount: newOrder.price_estimate - newOrder.advance_paid,
        payment_status: newOrder.advance_paid >= newOrder.price_estimate ? 'paid' : (newOrder.advance_paid > 0 ? 'partial' : 'unpaid')
      });
      return res.status(201).json(newOrder);
    }
    
    await db.query('START TRANSACTION');
    
    const [result] = await db.query(
      'INSERT INTO Orders (customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, advance_paid, status, notes, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, design_type, materials_provided_by || 'customer', trial_date, delivery_date, price_estimate || 0, advance_paid || 0, status || 'order_taken', notes || null, status === 'completed' ? new Date() : null]
    );
    
    const orderId = result.insertId;
    
    await db.query(
      'INSERT INTO Payments (order_id, advance_paid, remaining_amount, payment_status) VALUES (?, ?, ?, ?)',
      [orderId, advance_paid || 0, (price_estimate || 0) - (advance_paid || 0), (advance_paid || 0) >= (price_estimate || 0) ? 'paid' : (advance_paid > 0 ? 'partial' : 'unpaid')]
    );
    
    await db.query('COMMIT');
    
    res.status(201).json({ id: orderId, customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, advance_paid, status, notes });
  } catch (error) {
    const db = await getDb();
    if (db) await db.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    
    if (!db) {
      const index = mockData.orders.findIndex(o => o.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      const oldStatus = mockData.orders[index].status;
      mockData.orders[index].status = status;
      if (status === 'completed' && oldStatus !== 'completed') {
        mockData.orders[index].completed_at = new Date().toISOString();
      } else if (status !== 'completed') {
        mockData.orders[index].completed_at = null;
      }
      return res.json(mockData.orders[index]);
    }
    
    await db.query('UPDATE Orders SET status = ?, completed_at = CASE WHEN status != ? AND ? = "completed" THEN NOW() WHEN ? != "completed" THEN NULL ELSE completed_at END WHERE id = ?', [status, status, status, status, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, advance_paid, status, notes } = req.body;
    const db = await getDb();
    
    if (!db) {
      const index = mockData.orders.findIndex(o => o.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      const oldStatus = mockData.orders[index].status;
      const newCompletedAt = (status === 'completed' && oldStatus !== 'completed') 
        ? new Date().toISOString() 
        : (status === 'completed' ? mockData.orders[index].completed_at : null);

      mockData.orders[index] = { 
        ...mockData.orders[index], 
        customer_id: parseInt(customer_id), 
        design_type, 
        materials_provided_by, 
        trial_date, 
        delivery_date, 
        price_estimate: parseFloat(price_estimate) || 0, 
        advance_paid: parseFloat(advance_paid) || 0, 
        status, 
        notes,
        completed_at: newCompletedAt
      };
      return res.json(mockData.orders[index]);
    }
    
    await db.query('START TRANSACTION');
    
    await db.query(
      'UPDATE Orders SET customer_id = ?, design_type = ?, materials_provided_by = ?, trial_date = ?, delivery_date = ?, price_estimate = ?, advance_paid = ?, status = ?, notes = ?, completed_at = CASE WHEN status != ? AND ? = "completed" THEN NOW() WHEN ? != "completed" THEN NULL ELSE completed_at END WHERE id = ?',
      [customer_id, design_type, materials_provided_by || 'customer', trial_date, delivery_date, price_estimate || 0, advance_paid || 0, status || 'order_taken', notes || null, status, status, status, req.params.id]
    );
    
    const [payments] = await db.query('SELECT * FROM Payments WHERE order_id = ?', [req.params.id]);
    const newRemaining = Math.max(0, (price_estimate || 0) - (advance_paid || 0));
    let newStatus = 'partial';
    if (newRemaining <= 0) newStatus = 'paid';
    else if ((advance_paid || 0) === 0) newStatus = 'unpaid';
    
    if (payments.length > 0) {
      await db.query(
        'UPDATE Payments SET advance_paid = ?, remaining_amount = ?, payment_status = ? WHERE order_id = ?',
        [advance_paid || 0, newRemaining, newStatus, req.params.id]
      );
    } else {
      await db.query(
        'INSERT INTO Payments (order_id, advance_paid, remaining_amount, payment_status) VALUES (?, ?, ?, ?)',
        [req.params.id, advance_paid || 0, newRemaining, newStatus]
      );
    }
    
    await db.query('COMMIT');
    res.json({ id: req.params.id, customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, advance_paid, status, notes });
  } catch (error) {
    const db = await getDb();
    if (db) await db.query('ROLLBACK');
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const index = mockData.orders.findIndex(o => o.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      mockData.orders.splice(index, 1);
      return res.json({ message: 'Order deleted successfully' });
    }
    
    await db.query('DELETE FROM Orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
