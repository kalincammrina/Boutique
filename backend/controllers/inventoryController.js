import { getDb } from '../config/db.js';
import { mockData } from '../mockDb.js';

export const getAllInventory = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const sortedInventory = [...mockData.inventory].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return res.json(sortedInventory);
    }
    
    const [rows] = await db.query('SELECT * FROM Fabric_Inventory ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      const item = mockData.inventory.find(i => i.id === parseInt(req.params.id));
      return item ? res.json(item) : res.status(404).json({ error: 'Not found' });
    }
    
    const [rows] = await db.query('SELECT * FROM Fabric_Inventory WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Inventory item not found' });
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { fabric_name, fabric_id, stock_quantity, reorder_level } = req.body;
    const db = await getDb();
    
    if (!db) {
      const newItem = { 
        id: mockData.inventory.length > 0 ? Math.max(...mockData.inventory.map(i => i.id)) + 1 : 1, 
        fabric_name, 
        fabric_id, 
        stock_quantity: parseFloat(stock_quantity), 
        reorder_level: parseFloat(reorder_level), 
        created_at: new Date().toISOString()
      };
      mockData.inventory.push(newItem);
      return res.status(201).json(newItem);
    }
    
    const [result] = await db.query(
      'INSERT INTO Fabric_Inventory (fabric_name, fabric_id, stock_quantity, reorder_level) VALUES (?, ?, ?, ?)',
      [fabric_name, fabric_id, stock_quantity, reorder_level]
    );
    res.status(201).json({ id: result.insertId, fabric_name, fabric_id, stock_quantity, reorder_level });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { fabric_name, fabric_id, stock_quantity, reorder_level } = req.body;
    const db = await getDb();
    
    if (!db) {
      const index = mockData.inventory.findIndex(i => i.id === parseInt(req.params.id));
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      mockData.inventory[index] = { 
        ...mockData.inventory[index], 
        fabric_name, 
        fabric_id, 
        stock_quantity: parseFloat(stock_quantity), 
        reorder_level: parseFloat(reorder_level)
      };
      return res.json(mockData.inventory[index]);
    }
    
    await db.query(
      'UPDATE Fabric_Inventory SET fabric_name = ?, fabric_id = ?, stock_quantity = ?, reorder_level = ? WHERE id = ?',
      [fabric_name, fabric_id, stock_quantity, reorder_level, req.params.id]
    );
    res.json({ id: req.params.id, fabric_name, fabric_id, stock_quantity, reorder_level });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      mockData.inventory = mockData.inventory.filter(i => i.id !== parseInt(req.params.id));
      return res.json({ message: 'Inventory item deleted successfully' });
    }
    
    await db.query('DELETE FROM Fabric_Inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};
