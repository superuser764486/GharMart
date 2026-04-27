# Quick Start Guide - Zustand Cart & Razorpay Checkout

## 30-Second Setup

1. **Add environment variables:**
   ```env
   RAZORPAY_KEY_ID=<your_key>
   RAZORPAY_KEY_SECRET=<your_secret>
   NEXT_PUBLIC_RAZORPAY_KEY_ID=<your_key>
   ```

2. **Run database migration:**
   ```bash
   psql $DATABASE_URL -f scripts/002-create-orders-tables.sql
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Test the flow:**
   - Visit `/products` → Add items to cart
   - Visit `/cart` → See cart with Zustand state
   - Click "Proceed to Checkout" → `/checkout`
   - Select address & payment → Complete payment
   - See order confirmation at `/orders/[id]`

---

## Key Files to Know

| File | Purpose | What It Does |
|------|---------|-------------|
| `lib/store/cart-store.ts` | Cart state | Add/remove/update items, localStorage sync |
| `app/cart/page.tsx` | Shopping cart | Display items, apply promo codes |
| `app/checkout/page.tsx` | Checkout | Address selection, Razorpay integration |
| `app/orders/[id]/page.tsx` | Order details | Show order status, items, address |
| `app/api/orders/route.ts` | Create orders | POST /api/orders - create order |
| `app/api/orders/verify-payment/route.ts` | Verify payment | POST - verify Razorpay signature |
| `app/api/orders/[id]/route.ts` | Fetch order | GET - retrieve order details |

---

## Common Tasks

### Adding Items to Cart

```typescript
import { useCart } from '@/lib/store/cart-store';

const { addItem } = useCart();

addItem({
  productId: 'prod-123',
  name: 'Tomatoes',
  price: 50,
  quantity: 1,
  image_url: '/images/tomatoes.jpg'
});
```

### Getting Cart Total

```typescript
const { getTotal, getItemCount, items } = useCart();

const total = getTotal();        // ₹150
const count = getItemCount();    // 3 items
```

### Clearing Cart After Order

```typescript
const { clearCart } = useCart();

// After successful payment
clearCart();
```

### Verifying Payment

```typescript
// Backend verifies signature
const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
const signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(signatureBody)
  .digest('hex');

if (signature === razorpaySignature) {
  // Payment is valid
  await updateOrderStatus(orderId, 'paid');
}
```

---

## Payment Flow Diagram

```
User Adds Item
     ↓
[Cart Page] → Zustand Store + localStorage
     ↓
[Checkout Page]
     ↓
Select Address + Payment Method
     ↓
Click "Pay" Button
     ↓
POST /api/orders
     ↓
Create Order in DB
Get Razorpay Order ID
     ↓
Open Razorpay Modal
     ↓
User Enters Payment Details
     ↓
Razorpay Returns Signature
     ↓
POST /api/orders/verify-payment
Verify HMAC Signature
     ↓
Update Order Status = 'paid'
Clear Cart
     ↓
Redirect to /orders/[id]?success=true
     ↓
[Order Confirmation Page]
```

---

## API Cheat Sheet

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "1", "quantity": 2, "price": 100}],
    "addressId": "addr-123",
    "paymentMethod": "card",
    "total": 250
  }'

# Response:
# {
#   "order": {
#     "id": "order-123",
#     "razorpay_order_id": "order_1234567"
#   }
# }
```

### Verify Payment
```bash
curl -X POST http://localhost:3000/api/orders/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "razorpayOrderId": "order_1234567",
    "razorpayPaymentId": "pay_1234567",
    "razorpaySignature": "signature..."
  }'

# Response:
# { "success": true }
```

### Get Order
```bash
curl http://localhost:3000/api/orders/order-123

# Response:
# {
#   "order": {
#     "id": "order-123",
#     "status": "paid",
#     "total_amount": 250,
#     "items": [...],
#     "address": {...}
#   }
# }
```

---

## Database Tables

### orders
```sql
SELECT * FROM orders WHERE customer_id = 'user-123';

-- Fields:
-- id, customer_id, address_id, payment_method (card/upi/wallet/cod)
-- total_amount, status (pending/confirmed/paid/shipped/delivered)
-- razorpay_order_id, razorpay_payment_id, razorpay_signature
-- created_at, paid_at, delivered_at
```

### order_items
```sql
SELECT * FROM order_items WHERE order_id = 'order-123';

-- Fields:
-- id, order_id, product_id, quantity, price_at_purchase
```

---

## Promo Codes

| Code | Discount | Max | Conditions |
|------|----------|-----|-----------|
| SAVE10 | 10% off | No limit | Cart total > ₹0 |
| SAVE50 | ₹50 off | ₹50 max | Cart total > ₹50 |

**To add more codes:** Edit `app/cart/page.tsx` `applyPromoCode()` function

---

## Testing Credentials

### Razorpay Test Payment
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **OTP (if asked):** 123456

### Test User
- **Email:** test@example.com
- **Password:** (as per your auth setup)

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Cart empty after refresh | Check localStorage enabled |
| "Razorpay not defined" | Ensure script loaded, check browser console |
| Payment verification fails | Check RAZORPAY_KEY_SECRET correct |
| "Order not found" | User not authenticated, check JWT token |
| "Address not found" | User needs to add address at /account/addresses |
| 500 error on order creation | Check DATABASE_URL, tables exist |

---

## Code Examples

### Display Cart Count in Header

```tsx
import { useCart } from '@/lib/store/cart-store';

export function Header() {
  const { getItemCount } = useCart();
  const count = getItemCount();
  
  return (
    <header>
      <span>Cart ({count})</span>
    </header>
  );
}
```

### Handle Checkout Button

```tsx
async function handleCheckout() {
  const { items, clearCart } = useCart();
  
  if (items.length === 0) {
    alert('Cart is empty');
    return;
  }
  
  // Proceed to checkout
  router.push('/checkout');
}
```

### Add Item from Product Page

```tsx
import { useCart } from '@/lib/store/cart-store';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  
  return (
    <button onClick={() => addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url
    })}>
      Add to Cart
    </button>
  );
}
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CHECKOUT_IMPLEMENTATION.md` | Detailed architecture & database schema |
| `SETUP_INSTRUCTIONS.md` | Complete setup guide with troubleshooting |
| `IMPLEMENTATION_SUMMARY.md` | What was built, why, and how it works |
| `QUICK_START.md` | This file - quick reference |

---

## Next Steps

1. ✅ **Setup Environment**
   - Add Razorpay credentials
   - Run database migration

2. ✅ **Test Checkout Flow**
   - Add items to cart
   - Go through checkout
   - Complete test payment

3. ✅ **Customize**
   - Update promo codes
   - Modify delivery fees
   - Adjust tax rates

4. ✅ **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Update production env vars

5. ✅ **Monitor**
   - Check Razorpay dashboard
   - Monitor order creation
   - Track payment success rate

---

## Support Resources

- **Razorpay Docs:** https://razorpay.com/docs
- **Zustand Guide:** https://github.com/pmndrs/zustand
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Questions? Check the detailed documentation files above!**
