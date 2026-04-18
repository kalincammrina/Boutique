-- Boutique Management System - Database Setup Script

CREATE DATABASE IF NOT EXISTS boutique_db;
USE boutique_db;

-- 1. Customers
CREATE TABLE IF NOT EXISTS Customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    materials_provided_by ENUM('customer', 'boutique') DEFAULT 'customer',
    membership_plan ENUM('None', 'Silver', 'Gold', 'Platinum') DEFAULT 'None',
    membership_discount INT DEFAULT 0,
    membership_start_date DATE,
    membership_expiry_date DATE,
    membership_status ENUM('Active', 'Expired', 'Inactive') DEFAULT 'Inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Measurements
CREATE TABLE IF NOT EXISTS Measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hip DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeve_length DECIMAL(5,2),
    top_length DECIMAL(5,2),
    bottom_length DECIMAL(5,2),
    neck DECIMAL(5,2),
    arm_round DECIMAL(5,2),
    fitting_requirements TEXT,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    design_type VARCHAR(100) NOT NULL,
    materials_provided_by ENUM('customer', 'boutique') DEFAULT 'customer',
    trial_date DATE,
    delivery_date DATE,
    price_estimate DECIMAL(10,2),
    advance_paid DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('order_taken', 'in_progress', 'pending') DEFAULT 'order_taken',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- 4. Payments
CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    advance_paid DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    payment_mode ENUM('Cash', 'UPI', 'Card', 'Net Banking') DEFAULT 'Cash',
    payment_date DATE,
    membership_plan VARCHAR(50) DEFAULT 'None',
    original_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- V2 Advanced Features

-- 5. Measurement_Templates
CREATE TABLE IF NOT EXISTS Measurement_Templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'unisex') NOT NULL,
    size_category ENUM('xs', 's', 'm', 'l', 'xl', 'xxl') NOT NULL,
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hip DECIMAL(5,2),
    sleeve DECIMAL(5,2),
    shoulder DECIMAL(5,2)
);

-- 6. Customer_Measurements_History
CREATE TABLE IF NOT EXISTS Customer_Measurements_History (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    body_type VARCHAR(50),
    reference_images JSON,
    armhole DECIMAL(5,2),
    inseam DECIMAL(5,2),
    thigh DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- 7. Designs
CREATE TABLE IF NOT EXISTS Designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    style_tags VARCHAR(255),
    fabric_requirement DECIMAL(5,2), -- in meters
    gallery_images JSON,
    base_price DECIMAL(10,2) NOT NULL
);

-- 8. Fabric_Inventory
CREATE TABLE IF NOT EXISTS Fabric_Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fabric_name VARCHAR(100) NOT NULL,
    fabric_id VARCHAR(50) DEFAULT '',
    stock_quantity DECIMAL(10,2) DEFAULT 0.00,
    reorder_level DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Appointments
CREATE TABLE IF NOT EXISTS Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    type ENUM('measurement', 'trial', 'delivery') NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- 10. Loyalty_Points
CREATE TABLE IF NOT EXISTS Loyalty_Points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    points_earned INT DEFAULT 0,
    points_redeemed INT DEFAULT 0,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    type ENUM('order_update', 'payment_reminder') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- Insert some dummy data for testing
INSERT INTO Customers (name, phone, address, membership_plan, membership_discount, membership_status) VALUES 
('Alice Smith', '555-0101', '123 Main St', 'Gold', 10, 'Active'),
('Bob Johnson', '555-0102', '456 Oak Ave', 'None', 0, 'Inactive');

INSERT INTO Measurements (customer_id, bust, waist, hip, shoulder, sleeve_length, top_length, bottom_length, neck, arm_round, fitting_requirements) VALUES 
(1, 36.5, 28.0, 38.0, 15.0, 24.0, 22.0, 40.0, 14.0, 12.0, 'Prefers loose fit'),
(2, 42.0, 34.0, 40.0, 18.0, 25.5, 28.0, 42.0, 16.0, 14.0, 'Athletic build');

INSERT INTO Orders (customer_id, design_type, materials_provided_by, trial_date, delivery_date, price_estimate, status) VALUES 
(1, 'Evening Gown', 'boutique', '2026-04-01', '2026-04-10', 450.00, 'in_progress'),
(2, 'Two-Piece Suit', 'customer', '2026-03-25', '2026-04-05', 800.00, 'pending');

INSERT INTO Payments (order_id, advance_paid, discount, discount_amount, remaining_amount, payment_status, payment_mode, payment_date, membership_plan, original_amount, final_amount) VALUES 
(1, 200.00, 10.00, 45.00, 205.00, 'partial', 'Cash', '2026-03-20', 'Gold', 450.00, 405.00),
(2, 0.00, 0.00, 0.00, 800.00, 'unpaid', 'UPI', '2026-03-23', 'None', 800.00, 800.00);
