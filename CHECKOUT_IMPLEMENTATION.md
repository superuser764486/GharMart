# Checkout System Implementation Guide

## Overview

This document describes the Zustand-based cart management system and Razorpay payment integration for the GharMart e-commerce platform.

## Architecture

### 1. Cart Store (Zustand)

**Location:** `lib/store/cart-store.ts`

The cart is a global state managed with Zustand that persists to localStorage. It stores:
- Product items with ID, name, price, quantity, and image
- Methods to add, remove, update quantity, and clear items
- Computed values for total and item count

```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (item) => {...},
  removeItem: (productId) => {...},
  updateQuantity: (productId, quantity) => {...},
  getTotal: () => {...},
  clearCart: () => {...},
}));
```

### 2. Cart Page

**Location:** `app/cart/page.tsx`

Features:
- Display all cart items with images and prices
- Adjust quantities with +/- buttons
- Remove items from cart
- Apply promo codes (SAVE10 for 10% off, SAVE50 for ₹50 off)
- Calculate subtotal, tax (5%), and delivery fee (₹40)
- Sticky order summary sidebar
- Proceed to checkout button

### 3. Checkout Page

**Location:** `app/checkout/page.tsx`

The checkout flow handles:

#### Address Selection
- Fetch user's saved addresses from API
- Select delivery address via radio buttons
- Display full address with label, name, phone, street, city, state, postal code

#### Payment Methods
- Credit/Debit Card
- UPI
- Razorpay Wallet
- Cash on Delivery (COD)

#### Razorpay Integration
For non-COD payments:
1. Create order in database via `/api/orders` 
2. Get Razorpay order ID from response
3. Open Razorpay checkout with Razorpay.js
4. On successful payment, verify signature at `/api/orders/verify-payment`
5. Redirect to order confirmation page

For COD:
1. Create order with payment_method='cod'
2. Order status automatically set to 'confirmed'
3. Redirect to order page

### 4. Order Details Page

**Location:** `app/orders/[id]/page.tsx`

Displays:
- Order status with timeline visualization
- Order items with quantities and prices
- Delivery address
- Order total and payment method
- Links to continue shopping or view all orders

## Database Tables

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  address_id UUID NOT NULL,
  payment_method VARCHAR(50),
  total_amount DECIMAL(10, 2),
  status VARCHAR(50), -- pending, confirmed, paid, shipped, delivered, cancelled
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP,
  paid_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER,
  price_at_purchase DECIMAL(10, 2),
  created_at TIMESTAMP
);
```

## API Endpoints

### POST /api/orders
Creates an order and optionally a Razorpay order.

**Request:**
```json
{
  "items": [
    {"productId": "...", "quantity": 2, "price": 100}
  ],
  "addressId": "...",
  "paymentMethod": "card|upi|wallet|cod",
  "total": 250
}
```

**Response:**
```json
{
  "order": {
    "id": "...",
    "razorpay_order_id": "order_xxx" // null for COD
  }
}
```

### POST /api/orders/verify-payment
Verifies Razorpay payment signature and marks order as paid.

**Request:**
```json
{
  "orderId": "...",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature..."
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /api/orders/[id]
Fetches order details with items and address.

**Response:**
```json
{
  "order": {
    "id": "...",
    "status": "paid",
    "total_amount": 250,
    "payment_method": "card",
    "created_at": "2024-01-01T00:00:00Z",
    "address": {...},
    "items": [...]
  }
}
```

### GET /api/addresses
Fetches user's saved addresses (already implemented).

## Environment Variables

```env
# Razorpay (required for payment processing)
RAZORPAY_KEY_ID=<your_key_id>
RAZORPAY_KEY_SECRET=<your_key_secret>
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your_key_id> # Public, safe to expose

# Database
DATABASE_URL=<your_neon_database_url>
```

## Flow Diagram

```
Cart Page
  ↓
[Add/Remove/Update Items] → Zustand Store → localStorage
  ↓
Checkout Page
  ↓
[Select Address] → Fetch from API
  ↓
[Select Payment Method]
  ↓
  ├─ Card/UPI/Wallet → POST /api/orders → Get Razorpay Order ID
  │                  ↓
  │            Open Razorpay Modal
  │                  ↓
  │            [User pays on Razorpay]
  │                  ↓
  │            POST /api/orders/verify-payment
  │                  ↓
  │            Clear Cart → Redirect to Order Page
  │
  └─ COD → POST /api/orders → Create Order with status='confirmed'
                  ↓
           Clear Cart → Redirect to Order Page

Order Page
  ↓
Display Order Status & Details
  ↓
Links to: Continue Shopping | View All Orders
```

## Security Considerations

1. **JWT Authentication:** All API endpoints verify JWT token from cookies
2. **Signature Verification:** Razorpay payment signatures are verified server-side
3. **User Isolation:** Orders/Addresses can only be accessed by authenticated users
4. **Stock Management:** Product stock is updated when order is created
5. **Sensitive Data:** Razorpay secret key is kept server-side only

## Testing

### Test Payment Details (Razorpay Sandbox)
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 123456 (if prompted)

### Test Orders
1. Add items to cart
2. Go to checkout
3. Select address and payment method
4. Click "Pay"
5. Complete payment on Razorpay modal
6. Verify order on confirmation page

## Future Enhancements

1. Email notifications for order status changes
2. Order tracking with real-time updates
3. Order cancellation and refund handling
4. Partial refunds for returned items
5. Subscription-based payments
6. Multiple payment gateway support
7. Advanced order analytics dashboard
