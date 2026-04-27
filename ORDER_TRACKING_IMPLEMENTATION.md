# Order Management & Live Tracking Implementation

## Overview
This implementation adds comprehensive order management and live tracking functionality to the GharMart e-commerce platform. Customers can view their complete order history, track orders in real-time, and access order details with status timelines.

## Features Implemented

### 1. **Order Listing Page** (`/orders`)
- Displays all customer orders with pagination
- Search functionality by order ID
- Filter by order status (pending, confirmed, paid, shipped, delivered, cancelled)
- Shows order total amount, status, and date
- Quick visual status indicators with icons
- Responsive design for mobile and desktop

#### URL: `/orders`

**Components:**
- Order list with status badges
- Search and filter controls
- Pagination navigation
- Empty state with call-to-action to shop

### 2. **Order Detail Page** (`/orders/[id]`)
- Complete order information with real-time updates
- Visual status timeline showing all order stages
- Auto-refresh functionality (refreshes every 5 seconds while in transit)
- Order items breakdown with quantities and prices
- Order summary with subtotal, tax, and total
- Action buttons:
  - Download Invoice
  - Contact Support
  - Cancel Order (for pending orders)
  - Return/Exchange (for delivered orders)

#### Key Features:
- **Status Timeline**: Visual representation of order progress from placed → confirmed → paid → shipped → delivered
- **Live Auto-Refresh**: Automatically updates order status every 5 seconds (stops when delivered/cancelled)
- **Status Messages**: Contextual messages based on current order status
- **Order Items**: Lists all products in the order with purchase price and quantity

### 3. **API Endpoints**

#### `GET /api/customer/orders`
Lists all orders for the authenticated customer with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by order status
- `limit` (optional, default: 10): Number of results per page
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "status": "shipped",
      "total_amount": 1999.99,
      "payment_method": "razorpay",
      "created_at": "2024-04-27T10:30:00Z",
      "updated_at": "2024-04-27T15:45:00Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

#### `GET /api/customer/orders/[id]/status`
Fetches detailed information for a specific order including items and current status.

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "status": "shipped",
    "total_amount": 1999.99,
    "payment_method": "razorpay",
    "created_at": "2024-04-27T10:30:00Z",
    "updated_at": "2024-04-27T15:45:00Z",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Product Name",
        "quantity": 2,
        "price_at_purchase": 499.99
      }
    ]
  }
}
```

### 4. **Database Schema Updates**

#### New Tables:
- **order_status_history**: Tracks status changes for orders
- **order_tracking_updates**: Real-time location updates for deliveries
- **notification_preferences**: User notification settings

#### Updated Columns (orders table):
- `tracking_data` (JSONB): Additional tracking information
- `delivery_location` (JSONB): Current delivery location with coordinates

#### Migration Script:
- Located at: `scripts/07-order-tracking-migration.sql`
- Enables RLS policies for secure data access
- Creates necessary indexes for performance

### 5. **Authentication & Security**

- Uses JWT token-based authentication
- Validates token from HTTP-only cookies
- Ensures users can only access their own orders
- RLS policies protect data at the database level

#### JWT Payload Structure:
```typescript
{
  userId: string;
  email: string;
  userType: 'customer' | 'vendor';
  iat?: number;
  exp?: number;
}
```

### 6. **Order Status Workflow**

```
pending → confirmed → paid → shipped → delivered
                    ↓
                 cancelled
```

**Status Descriptions:**
- **Pending**: Order placed, awaiting confirmation
- **Confirmed**: Order confirmed by shop
- **Paid**: Payment received successfully
- **Shipped**: Order dispatched and on the way
- **Delivered**: Order delivered to customer
- **Cancelled**: Order cancelled by customer or system

## File Structure

```
app/
├── orders/
│   ├── page.tsx                    # Order list page
│   └── [id]/
│       └── page.tsx                # Order detail page with live tracking
└── api/
    └── customer/
        └── orders/
            ├── route.ts            # GET /api/customer/orders
            └── [id]/
                └── status/
                    └── route.ts    # GET /api/customer/orders/[id]/status

lib/
├── auth/
│   └── jwt.ts                      # JWT token utilities
└── database/
    └── connection.ts               # Database connection pool

scripts/
└── 07-order-tracking-migration.sql # Database migration
```

## UI/UX Features

### Visual Design:
- **Status Icons**: Each status stage has a unique icon for visual clarity
- **Progress Timeline**: Horizontal timeline showing order progression
- **Color Coding**: Status stages use color-coded backgrounds (yellow, blue, purple, green)
- **Responsive Layout**: Mobile-first design that scales to desktop
- **Loading States**: Skeleton loaders during data fetch
- **Empty States**: Helpful messages when no orders found

### Interactivity:
- **Auto-refresh Button**: Manual refresh for immediate updates
- **Real-time Updates**: Automatic status updates via API polling
- **Clickable Order Cards**: Links to detailed view
- **Status Indicators**: Visual badges showing current status
- **Action Buttons**: Context-aware actions based on order status

## Environment Variables Required

```
DATABASE_URL=postgresql://...    # PostgreSQL connection string
SESSION_SECRET=your-secret-key   # JWT secret key
```

## Setup Instructions

1. **Database Migration**:
   ```bash
   # Run the migration script
   psql $DATABASE_URL < scripts/07-order-tracking-migration.sql
   ```

2. **Environment Setup**:
   - Ensure `DATABASE_URL` and `SESSION_SECRET` are set
   - These are typically configured in `.env.local` or Vercel environment variables

3. **API Endpoints**:
   - Orders list API is now available at `GET /api/customer/orders`
   - Order detail API is available at `GET /api/customer/orders/[id]/status`

4. **Frontend**:
   - Visit `/orders` to see the order listing
   - Click on any order to see details and live tracking

## Performance Optimizations

1. **Database Indexes**: Created on frequently queried columns
2. **Connection Pooling**: Manages database connections efficiently
3. **Query Optimization**: Uses proper SQL joins and filtering
4. **Pagination**: Limits response size and improves load times
5. **Auto-refresh**: Only polls for active orders (not delivered/cancelled)

## Security Measures

1. **JWT Authentication**: Validates all API requests
2. **Row-Level Security**: Database policies enforce data access control
3. **Cookie-based Tokens**: HTTP-only cookies prevent XSS attacks
4. **SQL Parameterization**: Prevents SQL injection attacks
5. **User Validation**: Ensures users can only access their own data

## Future Enhancements

1. **Real-time WebSocket Updates**: Push notifications instead of polling
2. **Map Integration**: Show delivery location on map
3. **Estimated Delivery Time**: Display ETA for shipments
4. **Return Management**: Integrated returns process
5. **Order Notifications**: Email/SMS on status changes
6. **Driver Contact**: Direct contact with delivery person
7. **Rating & Review**: Post-delivery feedback system
8. **Invoice Download**: PDF invoice generation

## Testing

To test the implementation:

1. **Order Listing**:
   ```bash
   curl -H "Cookie: accessToken=YOUR_JWT_TOKEN" \
     http://localhost:3000/api/customer/orders
   ```

2. **Order Details**:
   ```bash
   curl -H "Cookie: accessToken=YOUR_JWT_TOKEN" \
     http://localhost:3000/api/customer/orders/ORDER_ID/status
   ```

## Troubleshooting

### API Returns 401 Unauthorized
- Check that JWT token is valid and not expired
- Verify `SESSION_SECRET` environment variable matches the signing key

### Orders Not Showing
- Verify customer_id in orders table matches authenticated user ID
- Check database connection is active
- Review database permissions and RLS policies

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that color classes are in the safelist if using Tailwind v3+
- Review `globals.css` for proper theme configuration

## Related Documentation

- [Checkout Implementation](./CHECKOUT_IMPLEMENTATION.md)
- [Database Schema](./scripts/01-create-schema.sql)
- [Customer Features](./scripts/05-customer-schema-upgrade.sql)
- [Authentication](./lib/auth.ts)
