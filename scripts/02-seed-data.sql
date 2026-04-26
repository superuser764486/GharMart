-- GharMart Seed Data
-- This script inserts initial data for development and testing

-- ============================================================================
-- CATEGORIES
-- ============================================================================
INSERT INTO categories (name, icon_url, description) VALUES
('Kirana', '/icons/kirana.png', 'Daily groceries and general stores'),
('Fruits', '/icons/fruits.png', 'Fresh fruits and produce'),
('Vegetables', '/icons/vegetables.png', 'Fresh vegetables and greens'),
('Grains', '/icons/grains.png', 'Rice, wheat, and grains'),
('Dairy', '/icons/dairy.png', 'Milk, cheese, and dairy products'),
('Bakery', '/icons/bakery.png', 'Bread, cakes, and pastries'),
('Meat', '/icons/meat.png', 'Meat, fish, and poultry'),
('Electronics', '/icons/electronics.png', 'Electronics and gadgets'),
('Pharmacy', '/icons/pharmacy.png', 'Medicines and health products'),
('Stationery', '/icons/stationery.png', 'Books and stationery'),
('Clothing', '/icons/clothing.png', 'Clothes and fashion'),
('Hardware', '/icons/hardware.png', 'Tools and hardware supplies')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE VENDORS AND SHOPS
-- ============================================================================

-- Vendor 1: Daily Groceries Shop
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor1@gharmart.com', '+919876543210', 'Rajesh Kumar', '110001', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km, is_new)
SELECT id, 'Daily Groceries', 'Your neighborhood daily grocery store', 'Kirana', 'Main Market, Karol Bagh', '110001', 'Delhi', 28.6353, 77.2050, '08:00:00', '22:00:00', 30, 45, 5, true
FROM users WHERE email = 'vendor1@gharmart.com';

-- Vendor 2: Fresh Fruits Corner
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor2@gharmart.com', '+919876543211', 'Priya Singh', '110015', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km, is_new)
SELECT id, 'Fresh Fruits Corner', 'Premium quality fresh fruits daily', 'Fruits', 'Sector 15, Rohini', '110015', 'Delhi', 28.7505, 77.0534, '07:00:00', '20:00:00', 25, 40, 4, true
FROM users WHERE email = 'vendor2@gharmart.com';

-- Vendor 3: Green Vegetables Fresh
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor3@gharmart.com', '+919876543212', 'Amit Patel', '110016', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km)
SELECT id, 'Green Vegetables Fresh', 'Organic and pesticide-free vegetables', 'Vegetables', 'West End, Dwarka', '110016', 'Delhi', 28.5683, 77.0412, '06:00:00', '21:00:00', 20, 35, 5
FROM users WHERE email = 'vendor3@gharmart.com';

-- Vendor 4: Dairy Delights
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor4@gharmart.com', '+919876543213', 'Vikram Reddy', '110017', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km)
SELECT id, 'Dairy Delights', 'Fresh milk and dairy products', 'Dairy', 'Pocket A-1, Dwarka', '110017', 'Delhi', 28.5680, 77.0500, '07:00:00', '21:00:00', 30, 45, 4
FROM users WHERE email = 'vendor4@gharmart.com';

-- Vendor 5: Bakery House
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor5@gharmart.com', '+919876543214', 'Neha Sharma', '110018', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km, is_new)
SELECT id, 'Bakery House', 'Fresh baked bread and pastries daily', 'Bakery', 'G Block, Dwarka', '110018', 'Delhi', 28.5750, 77.0450, '06:00:00', '20:00:00', 15, 30, 3, true
FROM users WHERE email = 'vendor5@gharmart.com';

-- Vendor 6: Grains & Spices
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor6@gharmart.com', '+919876543215', 'Suresh Chand', '110019', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km)
SELECT id, 'Grains & Spices', 'Quality grains, rice and spices', 'Grains', 'Tilak Nagar', '110019', 'Delhi', 28.5350, 77.0950, '08:00:00', '22:00:00', 35, 50, 6
FROM users WHERE email = 'vendor6@gharmart.com';

-- Vendor 7: Fresh Meat & Fish
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor7@gharmart.com', '+919876543216', 'Mohammed Ali', '110020', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km, is_new)
SELECT id, 'Fresh Meat & Fish', 'Premium quality fresh meat and seafood', 'Meat', 'RK Puram', '110020', 'Delhi', 28.5280, 77.1700, '07:00:00', '21:00:00', 30, 45, 5, true
FROM users WHERE email = 'vendor7@gharmart.com';

-- Vendor 8: Electronics Hub
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor8@gharmart.com', '+919876543217', 'Arun Kumar', '110021', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km)
SELECT id, 'Electronics Hub', 'Gadgets and electronics for your home', 'Electronics', 'Karol Bagh Market', '110021', 'Delhi', 28.6380, 77.2080, '10:00:00', '21:00:00', 45, 60, 7
FROM users WHERE email = 'vendor8@gharmart.com';

-- Vendor 9: Care Pharmacy
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor9@gharmart.com', '+919876543218', 'Dr. Sharma Medical', '110022', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km)
SELECT id, 'Care Pharmacy', 'Medicine and healthcare products', 'Pharmacy', 'Rajendra Place', '110022', 'Delhi', 28.6200, 77.2150, '09:00:00', '23:00:00', 20, 35, 6
FROM users WHERE email = 'vendor9@gharmart.com';

-- Vendor 10: Book & Stationery World
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('vendor10@gharmart.com', '+919876543219', 'Lisa Fernandes', '110023', 'Delhi', 'vendor')
RETURNING id INTO vendor_id;

INSERT INTO shops (vendor_id, name, description, category, address, pincode, city, latitude, longitude, opening_time, closing_time, delivery_time_min, delivery_time_max, delivery_radius_km, is_new)
SELECT id, 'Book & Stationery World', 'Books, notebooks and stationery items', 'Stationery', 'Connaught Place', '110023', 'Delhi', 28.6325, 77.1900, '10:00:00', '20:00:00', 40, 55, 5, true
FROM users WHERE email = 'vendor10@gharmart.com';

-- ============================================================================
-- SAMPLE PRODUCTS
-- ============================================================================

-- Products for Daily Groceries
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Rice - 5kg', 'Premium basmati rice', 'Grains', 450.00, 50, 'RICE5KG001', true
FROM shops s WHERE s.name = 'Daily Groceries' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Wheat Flour - 10kg', 'Refined wheat flour', 'Grains', 380.00, 30, 'WHEAT10KG001', true
FROM shops s WHERE s.name = 'Daily Groceries' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Oil - 1L', 'Refined sunflower oil', 'Kirana', 220.00, 40, 'OIL1L001', true
FROM shops s WHERE s.name = 'Daily Groceries' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Salt - 1kg', 'Iodized salt', 'Kirana', 25.00, 100, 'SALT1KG001', true
FROM shops s WHERE s.name = 'Daily Groceries' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Sugar - 1kg', 'Refined sugar', 'Kirana', 45.00, 60, 'SUGAR1KG001', true
FROM shops s WHERE s.name = 'Daily Groceries' LIMIT 1;

-- Products for Fresh Fruits Corner
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Mangoes - 1kg', 'Sweetest mangoes of the season', 'Fruits', 120.00, 50, 'MANGO1KG001', true
FROM shops s WHERE s.name = 'Fresh Fruits Corner' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Bananas - 1kg', 'Fresh and yellow bananas', 'Fruits', 60.00, 80, 'BANANA1KG001', true
FROM shops s WHERE s.name = 'Fresh Fruits Corner' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Oranges - 1kg', 'Citrus fresh oranges', 'Fruits', 80.00, 40, 'ORANGE1KG001', true
FROM shops s WHERE s.name = 'Fresh Fruits Corner' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Apples - 1kg', 'Imported red apples', 'Fruits', 150.00, 30, 'APPLE1KG001', true
FROM shops s WHERE s.name = 'Fresh Fruits Corner' LIMIT 1;

-- Products for Green Vegetables Fresh
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Tomatoes - 1kg', 'Fresh red tomatoes', 'Vegetables', 40.00, 70, 'TOMATO1KG001', true
FROM shops s WHERE s.name = 'Green Vegetables Fresh' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Onions - 1kg', 'Fresh onions', 'Vegetables', 35.00, 100, 'ONION1KG001', true
FROM shops s WHERE s.name = 'Green Vegetables Fresh' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Potatoes - 2kg', 'Fresh potatoes', 'Vegetables', 60.00, 80, 'POTATO2KG001', true
FROM shops s WHERE s.name = 'Green Vegetables Fresh' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Spinach - 500g', 'Fresh green spinach', 'Vegetables', 30.00, 40, 'SPINACH500G001', true
FROM shops s WHERE s.name = 'Green Vegetables Fresh' LIMIT 1;

-- Products for Dairy Delights
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Milk - 1L', 'Fresh cow milk', 'Dairy', 70.00, 100, 'MILK1L001', true
FROM shops s WHERE s.name = 'Dairy Delights' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Yogurt - 500g', 'Creamy yogurt', 'Dairy', 50.00, 60, 'YOGURT500G001', true
FROM shops s WHERE s.name = 'Dairy Delights' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Paneer - 500g', 'Fresh paneer cheese', 'Dairy', 180.00, 30, 'PANEER500G001', true
FROM shops s WHERE s.name = 'Dairy Delights' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Butter - 200g', 'Pure butter', 'Dairy', 120.00, 25, 'BUTTER200G001', true
FROM shops s WHERE s.name = 'Dairy Delights' LIMIT 1;

-- Products for Bakery House
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Whole Wheat Bread', 'Fresh whole wheat bread', 'Bakery', 50.00, 50, 'BREAD001', true
FROM shops s WHERE s.name = 'Bakery House' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Croissants - 2 pieces', 'Buttery croissants', 'Bakery', 80.00, 30, 'CROISSANT2001', true
FROM shops s WHERE s.name = 'Bakery House' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Cakes - 1kg', 'Chocolate cake', 'Bakery', 400.00, 15, 'CAKE1KG001', true
FROM shops s WHERE s.name = 'Bakery House' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Pastries - 6 pieces', 'Assorted pastries', 'Bakery', 150.00, 20, 'PASTRY6001', true
FROM shops s WHERE s.name = 'Bakery House' LIMIT 1;

-- Products for Grains & Spices
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Turmeric - 500g', 'Pure turmeric powder', 'Grains', 150.00, 40, 'TURMERIC500G001', true
FROM shops s WHERE s.name = 'Grains & Spices' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Chili Powder - 500g', 'Spicy red chili powder', 'Grains', 120.00, 35, 'CHILI500G001', true
FROM shops s WHERE s.name = 'Grains & Spices' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Cumin - 200g', 'Whole cumin seeds', 'Grains', 80.00, 50, 'CUMIN200G001', true
FROM shops s WHERE s.name = 'Grains & Spices' LIMIT 1;

-- Products for Fresh Meat & Fish
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Chicken - 1kg', 'Fresh farm chicken', 'Meat', 280.00, 40, 'CHICKEN1KG001', true
FROM shops s WHERE s.name = 'Fresh Meat & Fish' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Fish - 500g', 'Fresh river fish', 'Meat', 350.00, 25, 'FISH500G001', true
FROM shops s WHERE s.name = 'Fresh Meat & Fish' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Mutton - 1kg', 'Fresh mutton', 'Meat', 450.00, 20, 'MUTTON1KG001', true
FROM shops s WHERE s.name = 'Fresh Meat & Fish' LIMIT 1;

-- Products for Electronics Hub
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Phone Charger', 'Fast charging phone charger', 'Electronics', 499.00, 30, 'CHARGER001', true
FROM shops s WHERE s.name = 'Electronics Hub' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'USB Cable - 2m', 'Durable USB cable', 'Electronics', 199.00, 50, 'USBC2M001', true
FROM shops s WHERE s.name = 'Electronics Hub' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'LED Bulb - 9W', 'Energy efficient LED bulb', 'Electronics', 120.00, 60, 'LED9W001', true
FROM shops s WHERE s.name = 'Electronics Hub' LIMIT 1;

-- Products for Care Pharmacy
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Aspirin - 10 tablets', 'Pain relief tablets', 'Pharmacy', 50.00, 100, 'ASPIRIN10001', true
FROM shops s WHERE s.name = 'Care Pharmacy' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Cough Syrup - 100ml', 'Effective cough syrup', 'Pharmacy', 120.00, 50, 'COUGHSYRUP100ML001', true
FROM shops s WHERE s.name = 'Care Pharmacy' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Vitamin C - 30 tablets', 'Immunity booster', 'Pharmacy', 180.00, 40, 'VITC30001', true
FROM shops s WHERE s.name = 'Care Pharmacy' LIMIT 1;

-- Products for Book & Stationery World
INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Notebook - 100 pages', 'Spiral notebook', 'Stationery', 60.00, 80, 'NOTEBOOK100001', true
FROM shops s WHERE s.name = 'Book & Stationery World' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Pen Set - 10 pieces', 'Ball point pen set', 'Stationery', 100.00, 50, 'PENSET10001', true
FROM shops s WHERE s.name = 'Book & Stationery World' LIMIT 1;

INSERT INTO products (shop_id, vendor_id, name, description, category, price, quantity, sku, is_available)
SELECT s.id, s.vendor_id, 'Book - Fiction Novel', 'English fiction novel', 'Stationery', 350.00, 20, 'BOOK001', true
FROM shops s WHERE s.name = 'Book & Stationery World' LIMIT 1;

-- ============================================================================
-- SAMPLE CUSTOMER AND REVIEWS
-- ============================================================================

-- Create sample customers
INSERT INTO users (email, phone, name, pincode, city, user_type) VALUES
('customer1@gharmart.com', '+919999999999', 'Rahul Verma', '110001', 'Delhi', 'customer'),
('customer2@gharmart.com', '+919999999998', 'Shreya Patel', '110015', 'Delhi', 'customer'),
('customer3@gharmart.com', '+919999999997', 'Akshay Malhotra', '110016', 'Delhi', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Add some reviews
INSERT INTO reviews (shop_id, user_id, rating, comment)
SELECT s.id, u.id, 5, 'Excellent quality products and fast delivery!'
FROM shops s 
JOIN users u ON u.email = 'customer1@gharmart.com'
WHERE s.name = 'Daily Groceries' LIMIT 1;

INSERT INTO reviews (shop_id, user_id, rating, comment)
SELECT s.id, u.id, 4, 'Great selection of fresh fruits, very satisfied'
FROM shops s
JOIN users u ON u.email = 'customer2@gharmart.com'
WHERE s.name = 'Fresh Fruits Corner' LIMIT 1;

INSERT INTO reviews (shop_id, user_id, rating, comment)
SELECT s.id, u.id, 5, 'Best vegetables in the area, highly recommended'
FROM shops s
JOIN users u ON u.email = 'customer3@gharmart.com'
WHERE s.name = 'Green Vegetables Fresh' LIMIT 1;

INSERT INTO reviews (shop_id, user_id, rating, comment)
SELECT s.id, u.id, 4, 'Fresh dairy products delivered on time'
FROM shops s
JOIN users u ON u.email = 'customer1@gharmart.com'
WHERE s.name = 'Dairy Delights' LIMIT 1;

INSERT INTO reviews (shop_id, user_id, rating, comment)
SELECT s.id, u.id, 5, 'Best bakery in town, fresh bread every morning'
FROM shops s
JOIN users u ON u.email = 'customer2@gharmart.com'
WHERE s.name = 'Bakery House' LIMIT 1;

-- ============================================================================
-- CREATE TEST ADMIN USER
-- ============================================================================
INSERT INTO users (email, phone, name, user_type) VALUES
('admin@gharmart.com', '+919876543220', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin' FROM users WHERE email = 'admin@gharmart.com'
ON CONFLICT (user_id) DO NOTHING;
