# Order Tracking Feature - Quick Setup Guide

## What Was Implemented

A complete Order Management & Live Tracking system for the GharMart e-commerce platform with:

1. **Order List Page** (`/orders`)
   - View all your orders with status, amount, and date
   - Search by order ID
   - Filter by status (pending, confirmed, paid, shipped, delivered, cancelled)
   - Pagination for easier browsing

2. **Order Detail Page** (`/orders/[id]`)
   - Complete order information with real-time updates
   - Visual timeline showing order progression
   - Auto-refresh every 5 seconds while order is in transit
   - Order items breakdown with prices
   - Order summary with tax and total
   - Action buttons (Download Invoice, Contact Support, Cancel Order, Return/Exchange)

3. **REST APIs**
   - `GET /api/customer/orders` - List customer orders
   - `GET /api/customer/orders/[id]/status` - Get order details with items

4. **Database Updates**
   - New tables for order tracking history
   - Migration script included

## Installation Steps

### 1. Apply Database Migration

```bash
# Connect to your PostgreSQL database and run:
psql $DATABASE_URL < scripts/07-order-tracking-migration.sql
```

Or if using Supabase SQL Editor:
- Copy the contents of `scripts/07-order-tracking-migration.sql`
- Paste into SQL Editor and execute

### 2. Environment Variables

Ensure these are set in your `.env.local` or Vercel environment:

```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-secret-key-here
```

### 3. Verify Setup

Test the API endpoints:

```bash
# Login first and get your JWT token from cookies
# Then test the orders endpoint:

curl -H "Cookie: accessToken=YOUR_TOKEN" \
  http://localhost:3000/api/customer/orders

# Test order detail endpoint:
curl -H "Cookie: accessToken=YOUR_TOKEN" \
  http://localhost:3000/api/customer/orders/ORDER_ID/status
```

## File Changes Summary

### New Files Created:
- `/app/api/customer/orders/route.ts` - Orders list API
- `/app/api/customer/orders/[id]/status/route.ts` - Order detail API
- `/scripts/07-order-tracking-migration.sql` - Database migration
- `/ORDER_TRACKING_IMPLEMENTATION.md` - Detailed documentation
- `/ORDER_TRACKING_SETUP.md` - This file

### Files Modified:
- `/app/orders/page.tsx` - Updated to use new API
- `/app/orders/[id]/page.tsx` - Updated with live tracking UI

## Order Status Flow

```
pending
   ↓
confirmed
   ↓
paid
   ↓
shipped
   ↓
delivered

(Can cancel anytime → cancelled)
```

## Features Explanation

### Auto-Refresh on Order Detail Page
- Automatically refreshes every 5 seconds while order is pending/confirmed/paid/shipped
- Stops refreshing once order is delivered or cancelled
- Manual refresh button always available
- Shows real-time status updates

### Search & Filter
- Search orders by order ID
- Filter by status to see only relevant orders
- Pagination with configurable page size
- Shows total order count

### Visual Status Indicators
- Color-coded status badges (yellow, blue, purple, green, red)
- Icons for each status stage
- Progress timeline visualization
- Current status highlighted with ring indicator

## Security Features

✅ **JWT Authentication** - All API endpoints require valid token
✅ **Database RLS** - Row-level security policies protect data
✅ **Token Validation** - API verifies user identity and ownership
✅ **HTTP-Only Cookies** - XSS protection
✅ **SQL Parameterization** - SQL injection prevention

## Performance Optimizations

✅ **Database Indexes** - Fast queries on customer_id, status, created_at
✅ **Connection Pooling** - Efficient database connection management
✅ **Pagination** - Limits data transfer
✅ **Smart Auto-Refresh** - Only polls active orders
✅ **Client-side Caching** - Reduces unnecessary API calls

## Troubleshooting

### Orders Not Appearing?
1. Check you're logged in (valid JWT token in cookies)
2. Verify orders exist in database for your user
3. Check DATABASE_URL is correctly set
4. Look at browser console for API errors

### API Returns 401?
1. Ensure SESSION_SECRET matches between client and server
2. Check token is not expired
3. Verify cookie is being sent with request

### Styling Issues?
1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Check Tailwind CSS is properly configured
4. Verify `globals.css` is imported in layout

## Database Tables

### orders
- id, customer_id, address_id, payment_method, total_amount
- status, created_at, updated_at, paid_at, delivered_at
- razorpay_* fields for payment tracking
- tracking_data, delivery_location (JSONB fields for future enhancements)

### order_items
- id, order_id, product_id, quantity, price_at_purchase

### order_status_history
- Tracks all status changes for audit trail

### order_tracking_updates
- Stores real-time location updates during delivery

### notification_preferences
- User preferences for notifications

## API Response Examples

### List Orders Response
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "shipped",
      "total_amount": 1999.99,
      "payment_method": "razorpay",
      "created_at": "2024-04-27T10:30:00Z",
      "updated_at": "2024-04-27T15:45:00Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

### Order Detail Response
```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "shipped",
    "total_amount": 1999.99,
    "payment_method": "razorpay",
    "created_at": "2024-04-27T10:30:00Z",
    "updated_at": "2024-04-27T15:45:00Z",
    "items": [
      {
        "id": "item-uuid",
        "product_id": "product-uuid",
        "product_name": "Organic Tomatoes",
        "quantity": 2,
        "price_at_purchase": 49.99
      }
    ]
  }
}
```

## Future Enhancements Available

These are ready to implement if needed:

1. **WebSocket Real-time Updates** - Push updates instead of polling
2. **Map Integration** - Show delivery location on map
3. **Estimated Delivery Time** - Display ETA
4. **Email Notifications** - Send on status changes
5. **SMS Notifications** - Text updates
6. **Driver Contact** - Direct communication
7. **Rating & Review** - Post-delivery feedback
8. **Invoice PDF** - Download receipt

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers

## Testing Checklist

- [ ] Can view order list
- [ ] Can search by order ID
- [ ] Can filter by status
- [ ] Can navigate pages
- [ ] Can click order to see details
- [ ] Order detail page loads
- [ ] Status timeline displays correctly
- [ ] Auto-refresh updates order status
- [ ] Manual refresh button works
- [ ] Can view order items
- [ ] Can see order summary
- [ ] Action buttons are visible

## Support

For issues or questions:
1. Check the detailed docs: `ORDER_TRACKING_IMPLEMENTATION.md`
2. Review API responses in browser dev tools
3. Check database migration was applied
4. Verify environment variables are set

## Next Steps

1. Test the feature in development
2. Deploy database migration to production
3. Deploy code to production
4. Monitor API logs for errors
5. Gather user feedback
6. Implement future enhancements based on usage

---

**Implementation Date:** April 27, 2024
**Version:** 1.0
**Status:** Ready for Testing
