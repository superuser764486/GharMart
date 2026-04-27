# GharMart Checkout System - Setup Instructions

## Quick Start

### 1. Install Dependencies

All required dependencies are already installed in `package.json`:
- `zustand`: State management for cart
- `razorpay`: Razorpay payment SDK
- `axios`: HTTP client (optional, using native fetch now)

### 2. Set Up Environment Variables

Add these to your `.env.local` or Vercel project settings:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Database
DATABASE_URL=your_neon_database_url
```

### 3. Run Database Migrations

Execute the SQL migration to create `orders` and `order_items` tables:

**Option A: Using psql CLI**
```bash
psql $DATABASE_URL -f scripts/002-create-orders-tables.sql
```

**Option B: Using Node.js script**
```bash
node --env-file-if-exists=.env.local scripts/run-migration.js scripts/002-create-orders-tables.sql
```

**Option C: Manual execution**
Copy the SQL from `scripts/002-create-orders-tables.sql` and run in your Neon dashboard query editor.

### 4. Start Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit `http://localhost:3000` and test the checkout flow.

## Integration Points

### With Existing Code

The new checkout system integrates with:

1. **Authentication** - Uses existing JWT tokens from cookies
   - `lib/auth/jwt.ts` - Token verification
   - Protects all API endpoints

2. **Addresses** - Uses existing address management
   - `app/api/addresses/route.ts` - Fetches user addresses
   - Displays in checkout for delivery selection

3. **Products** - Cart stores product references
   - Product data fetched client-side
   - Stock updated on order creation

4. **Header** - Uses existing Header component
   - Displays on all pages

## File Structure

```
app/
├── cart/
│   └── page.tsx                    # Cart display and promo codes
├── checkout/
│   └── page.tsx                    # Checkout form + Razorpay integration
├── orders/
│   └── [id]/
│       └── page.tsx                # Order confirmation page
└── api/
    ├── orders/
    │   ├── route.ts                # POST /api/orders (create order)
    │   ├── [id]/
    │   │   └── route.ts            # GET /api/orders/[id] (fetch order)
    │   └── verify-payment/
    │       └── route.ts            # POST (verify Razorpay signature)
    └── addresses/
        └── route.ts                # (existing) GET/POST addresses

lib/
├── store/
│   └── cart-store.ts               # Zustand cart store
└── database/
    └── connection.ts               # (existing) Database connection

scripts/
├── 001-*.sql                       # (existing) Previous migrations
├── 002-create-orders-tables.sql    # Orders schema
└── run-migration.js                # Migration runner
```

## Testing the Flow

### 1. Add Items to Cart

```
POST request or click "Add to Cart" on product pages
→ Items stored in Zustand store
→ Persisted to localStorage automatically
```

### 2. View Cart

```
Navigate to /cart
→ See items with quantity controls
→ Apply promo codes (SAVE10 or SAVE50)
→ View order summary with tax and delivery
```

### 3. Proceed to Checkout

```
Click "Proceed to Checkout" 
→ Redirects to /checkout (with auth check)
→ Loads user addresses from API
```

### 4. Select Address & Payment

```
Select delivery address and payment method
→ Methods: Card, UPI, Wallet, COD
→ Order summary updates based on selection
```

### 5. Complete Payment

**For Card/UPI/Wallet:**
```
Click "Pay" button
→ POST /api/orders creates order in DB
→ Razorpay modal opens with amount
→ User completes payment
→ POST /api/orders/verify-payment verifies signature
→ Order status changed to 'paid'
→ Redirects to /orders/[id]?success=true
```

**For COD:**
```
Click "Pay" button (or text shows "You will pay at delivery")
→ POST /api/orders creates order with status='confirmed'
→ Order status saved as 'confirmed'
→ Redirects to /orders/[id]?success=true
```

### 6. View Order

```
Navigate to /orders/[id]
→ See success message if ?success=true
→ Display order timeline
→ Show items, address, total amount
→ Links to continue shopping or view all orders
```

## Razorpay Setup

### Getting Credentials

1. Create account at https://razorpay.com
2. Go to Settings → API Keys
3. Copy **Key ID** and **Key Secret**
4. Use **Key ID** for both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. Keep **Key Secret** safe (server-side only)

### Test Credentials

For development/testing use:
- **Card:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits

### Production Deployment

When deploying to production:
1. Update to production Razorpay credentials
2. Ensure all environment variables are set in Vercel
3. Test payment flow in Razorpay dashboard
4. Monitor order creation and payment status

## API Response Examples

### Create Order (POST /api/orders)

**Success (₹250 total):**
```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "razorpay_order_id": "order_1234567890"
  }
}
```

**Error:**
```json
{
  "error": "Missing required fields"
}
```

### Verify Payment (POST /api/orders/verify-payment)

**Success:**
```json
{
  "success": true
}
```

**Error:**
```json
{
  "error": "Invalid payment signature",
  "success": false
}
```

### Get Order (GET /api/orders/[id])

```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "paid",
    "total_amount": 250.00,
    "payment_method": "card",
    "created_at": "2024-01-15T10:30:00Z",
    "address": {
      "full_name": "John Doe",
      "street_address": "123 Main St",
      "city": "New Delhi",
      "state": "Delhi",
      "postal_code": "110001"
    },
    "items": [
      {
        "id": "item-1",
        "product_id": "prod-1",
        "product_name": "Tomatoes",
        "quantity": 2,
        "price_at_purchase": 50.00
      }
    ]
  }
}
```

## Troubleshooting

### "Order not found" on checkout page

- User not authenticated
- Clear cookies and log in again
- Check JWT token is valid

### Razorpay modal not opening

- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify Razorpay script loaded: check browser console
- Ensure JavaScript is enabled

### "Payment verification failed"

- Razorpay key mismatch
- Signature validation failed
- Check `RAZORPAY_KEY_SECRET` is correct

### Cart items not persisting

- localStorage disabled in browser
- Private browsing mode
- Clear site data and reload

### "Address not found" error

- User has no saved addresses
- Need to add address at `/account/addresses` first
- Check API response with network inspector

## Performance Optimization

### Cart Store
- Uses localStorage for persistence
- Only re-renders affected components (Zustand)
- No server round-trip for cart updates

### Checkout
- Addresses fetched once on page load
- Lazy loads Razorpay script
- Server-side signature verification

### Order Details
- Server-rendered with authentication check
- Uses parameterized queries (prevents SQL injection)
- Indexes on `customer_id`, `status`, `created_at`

## Security Checklist

- [x] JWT authentication on all endpoints
- [x] Server-side signature verification for Razorpay
- [x] Parameterized SQL queries
- [x] User isolation (can't view others' orders)
- [x] Razorpay secret kept server-side only
- [x] Stock management synchronized with orders
- [x] HTTPS required for production

## Next Steps

1. **Email Notifications**
   - Send confirmation when order created
   - Send shipping notification
   - Send delivery confirmation

2. **Order Management**
   - Cancel orders (with refund)
   - Track order status in real-time
   - View order history

3. **Admin Dashboard**
   - View all orders
   - Update order status
   - Generate reports

4. **Payment Enhancements**
   - Support more gateways (Stripe, PayPal)
   - Recurring subscriptions
   - Partial refunds

5. **Analytics**
   - Track conversion funnel
   - Monitor payment success rates
   - Analyze customer behavior

## Support

For issues or questions:
1. Check browser console for errors
2. Review network tab for API calls
3. Check Razorpay dashboard for payment records
4. Contact Razorpay support: support@razorpay.com
