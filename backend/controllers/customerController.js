import { getDb } from '../config/db.js';
import { mockData } from '../mockDb.js';

export const getAllCustomers = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      // For mock data, we need to count orders to determine customer type
      const customersWithStats = mockData.customers.map(c => {
        const orderCount = mockData.orders.filter(o => o.customer_id === c.id).length;
        return { ...c, order_count: orderCount };
      });
      return res.json(customersWithStats);
    }
    
    const [rows] = await db.query(`
      SELECT c.*, COUNT(o.id) as order_count, MAX(o.created_at) as last_order_date
      FROM Customers c
      LEFT JOIN Orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const customer = mockData.customers.find(c => c.id === parseInt(req.params.id));
      if (!customer) return res.status(404).json({ error: 'Not found' });
      const measurements = mockData.measurements.find(m => m.customer_id === customer.id);
      const orderCount = mockData.orders.filter(o => o.customer_id === customer.id).length;
      return res.json({ ...customer, measurements, order_count: orderCount });
    }
    
    const [rows] = await db.query('SELECT * FROM Customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    
    const [measurements] = await db.query('SELECT * FROM Measurements WHERE customer_id = ?', [req.params.id]);
    
    res.json({ ...rows[0], measurements: measurements[0] || null });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, materials_provided_by, measurements, membership_plan, membership_discount, membership_start_date, membership_expiry_date, membership_status } = req.body;
    const db = await getDb();
    
    if (!db) {
      const newCustomer = { 
        id: mockData.customers.length > 0 ? Math.max(...mockData.customers.map(c => c.id)) + 1 : 1, 
        name, 
        phone, 
        email, 
        address, 
        materials_provided_by: materials_provided_by || 'customer', 
        created_at: new Date().toISOString(), 
        measurements,
        membership_plan,
        membership_discount,
        membership_start_date,
        membership_expiry_date,
        membership_status
      };
      mockData.customers.push(newCustomer);
      if (measurements) {
        mockData.measurements.push({ ...measurements, id: mockData.measurements.length + 1, customer_id: newCustomer.id });
      }
      return res.status(201).json(newCustomer);
    }
    
    await db.query('START TRANSACTION');
    
    const [result] = await db.query(
      'INSERT INTO Customers (name, phone, email, address, materials_provided_by, membership_plan, membership_discount, membership_start_date, membership_expiry_date, membership_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email, address, materials_provided_by || 'customer', membership_plan || 'None', membership_discount || 0, membership_start_date || null, membership_expiry_date || null, membership_status || null]
    );
    
    const customerId = result.insertId;
    
    if (measurements && Object.keys(measurements).length > 0) {
      const { bust, waist, hip, shoulder, sleeve_length, top_length, bottom_length, neck, arm_round, fitting_requirements } = measurements;
      await db.query(
        'INSERT INTO Measurements (customer_id, bust, waist, hip, shoulder, sleeve_length, top_length, bottom_length, neck, arm_round, fitting_requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [customerId, bust || null, waist || null, hip || null, shoulder || null, sleeve_length || null, top_length || null, bottom_length || null, neck || null, arm_round || null, fitting_requirements || null]
      );
    }
    
    await db.query('COMMIT');
    
    res.status(201).json({ id: customerId, name, phone, email, address, measurements });
  } catch (error) {
    const db = await getDb();
    if (db) await db.query('ROLLBACK');
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, materials_provided_by, measurements, membership_plan, membership_discount, membership_start_date, membership_expiry_date, membership_status } = req.body;
    const db = await getDb();
    
    if (!db) {
      const index = mockData.customers.findIndex(c => c.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      mockData.customers[index] = { 
        ...mockData.customers[index], 
        name, phone, email, address, 
        materials_provided_by: materials_provided_by || 'customer',
        membership_plan,
        membership_discount,
        membership_start_date,
        membership_expiry_date,
        membership_status
      };
      
      if (measurements) {
        const mIndex = mockData.measurements.findIndex(m => m.customer_id === parseInt(req.params.id));
        if (mIndex > -1) {
          mockData.measurements[mIndex] = { ...mockData.measurements[mIndex], ...measurements };
        } else {
          mockData.measurements.push({ ...measurements, id: mockData.measurements.length + 1, customer_id: parseInt(req.params.id) });
        }
      }
      return res.json(mockData.customers[index]);
    }
    
    await db.query('START TRANSACTION');
    
    await db.query(
      'UPDATE Customers SET name = ?, phone = ?, email = ?, address = ?, materials_provided_by = ?, membership_plan = ?, membership_discount = ?, membership_start_date = ?, membership_expiry_date = ?, membership_status = ? WHERE id = ?',
      [name, phone, email, address, materials_provided_by || 'customer', membership_plan || 'None', membership_discount || 0, membership_start_date || null, membership_expiry_date || null, membership_status || null, req.params.id]
    );
    
    if (measurements) {
      const { bust, waist, hip, shoulder, sleeve_length, top_length, bottom_length, neck, arm_round, fitting_requirements } = measurements;
      
      const [existing] = await db.query('SELECT id FROM Measurements WHERE customer_id = ?', [req.params.id]);
      
      if (existing.length > 0) {
        await db.query(
          'UPDATE Measurements SET bust = ?, waist = ?, hip = ?, shoulder = ?, sleeve_length = ?, top_length = ?, bottom_length = ?, neck = ?, arm_round = ?, fitting_requirements = ? WHERE customer_id = ?',
          [bust || null, waist || null, hip || null, shoulder || null, sleeve_length || null, top_length || null, bottom_length || null, neck || null, arm_round || null, fitting_requirements || null, req.params.id]
        );
      } else {
        await db.query(
          'INSERT INTO Measurements (customer_id, bust, waist, hip, shoulder, sleeve_length, top_length, bottom_length, neck, arm_round, fitting_requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [req.params.id, bust || null, waist || null, hip || null, shoulder || null, sleeve_length || null, top_length || null, bottom_length || null, neck || null, arm_round || null, fitting_requirements || null]
        );
      }
    }
    
    await db.query('COMMIT');
    res.json({ id: req.params.id, name, phone, email, address, measurements });
  } catch (error) {
    const db = await getDb();
    if (db) await db.query('ROLLBACK');
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      mockData.customers = mockData.customers.filter(c => c.id !== parseInt(req.params.id));
      return res.json({ message: 'Customer deleted successfully' });
    }
    
    await db.query('DELETE FROM Customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
