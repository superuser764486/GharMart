# Deployment Checklist - Zustand Cart & Razorpay Checkout

## Pre-Deployment

### Local Testing
- [ ] All npm dependencies installed (`npm install`)
- [ ] App runs locally without errors (`npm run dev`)
- [ ] No TypeScript errors in code
- [ ] All routes accessible and functional

### Cart Functionality
- [ ] Add items to cart → Items appear
- [ ] Update quantity → Total updates
- [ ] Remove item → Item disappears
- [ ] Apply promo code → Discount applied
- [ ] Cart persists after page refresh (localStorage)
- [ ] Clear cart works

### Checkout Flow
- [ ] Checkout page loads without errors
- [ ] Addresses load from API
- [ ] Can select address
- [ ] Can select payment method
- [ ] Order summary displays correctly

### Payment Testing
- [ ] Razorpay script loads (check console)
- [ ] Test payment with Razorpay test card
- [ ] Payment completes successfully
- [ ] Order created in database
- [ ] Order status updates to 'paid'
- [ ] Redirect to order confirmation page
- [ ] Cart clears after successful payment

### COD Testing
- [ ] Can select "Cash on Delivery" option
- [ ] Order created with status 'confirmed'
- [ ] No payment modal opens
- [ ] Redirect to order confirmation page

### Order Details
- [ ] Order page loads with correct data
- [ ] Success message displays if ?success=true
- [ ] Order status shows correct value
- [ ] Items list is complete
- [ ] Delivery address displays
- [ ] Total amount is correct
- [ ] Links to continue shopping work

### Error Handling
- [ ] Empty cart → Shows empty state
- [ ] No addresses → Shows add address link
- [ ] Invalid payment → Shows error message
- [ ] Failed API call → Shows error message
- [ ] Unauthenticated user → Redirects to login

---

## Environment Variables Setup

### Development (.env.local)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
DATABASE_URL=postgresql://user:pass@host/db
```

- [ ] All variables present in .env.local
- [ ] No exposed secrets in code
- [ ] All values correct for dev environment

### Production (Vercel)
- [ ] Production Razorpay credentials obtained
- [ ] Added RAZORPAY_KEY_ID to Vercel env vars
- [ ] Added RAZORPAY_KEY_SECRET to Vercel env vars (secret)
- [ ] Added NEXT_PUBLIC_RAZORPAY_KEY_ID to Vercel env vars
- [ ] DATABASE_URL points to production database
- [ ] All other required env vars present

---

## Database Migration

### Pre-Deployment Check
- [ ] Migration file exists: `scripts/002-create-orders-tables.sql`
- [ ] Migration script exists: `scripts/run-migration.js`
- [ ] Backup of current database taken
- [ ] Migration tested locally successfully

### Execution Methods
- [ ] Via psql: `psql $DATABASE_URL -f scripts/002-create-orders-tables.sql`
- [ ] OR via Node: `node scripts/run-migration.js`
- [ ] OR manual SQL execution in database console

### Post-Migration Verification
- [ ] `orders` table created successfully
- [ ] `order_items` table created successfully
- [ ] All indexes created
- [ ] Foreign key relationships work
- [ ] Can insert test record without errors

---

## Code Quality

### Linting & Formatting
- [ ] Run linter: `npm run lint` (no errors)
- [ ] Format code: `npm run format` (if configured)
- [ ] No console.log statements left (except debug ones marked as [v0])
- [ ] No commented-out code blocks

### TypeScript
- [ ] No `any` types without justification
- [ ] All API responses properly typed
- [ ] All component props typed
- [ ] Build succeeds: `npm run build`

### Security Review
- [ ] No hardcoded secrets in code
- [ ] No API keys exposed in frontend (except public ones)
- [ ] All routes have proper authentication
- [ ] SQL queries are parameterized
- [ ] User input is validated

### Performance
- [ ] Images optimized (use Next.js Image component)
- [ ] No unnecessary re-renders
- [ ] Lazy load Razorpay script
- [ ] Database queries use indexes
- [ ] No N+1 query problems

---

## API Endpoints

### POST /api/orders
- [ ] Requires authentication (JWT)
- [ ] Validates all required fields
- [ ] Creates order in database
- [ ] Creates Razorpay order if needed
- [ ] Updates product stock
- [ ] Returns correct response format
- [ ] Handles errors gracefully

### POST /api/orders/verify-payment
- [ ] Verifies HMAC signature correctly
- [ ] Updates order status to 'paid'
- [ ] Records payment details
- [ ] Returns success response
- [ ] Rejects invalid signatures
- [ ] Handles errors gracefully

### GET /api/orders/[id]
- [ ] Requires authentication (JWT)
- [ ] Validates order belongs to user
- [ ] Returns complete order data
- [ ] Includes address information
- [ ] Includes order items
- [ ] Handles 404 correctly

### GET /api/addresses (existing)
- [ ] Still works with new checkout
- [ ] Returns user's addresses
- [ ] Marks default address

---

## Frontend Components

### Cart Page (`app/cart/page.tsx`)
- [ ] Uses Zustand store correctly
- [ ] Displays all items
- [ ] Quantity controls work
- [ ] Remove button works
- [ ] Promo code logic correct
- [ ] Total calculation accurate
- [ ] Empty cart state works
- [ ] Continue shopping button works

### Checkout Page (`app/checkout/page.tsx`)
- [ ] Redirects if cart empty
- [ ] Fetches addresses on load
- [ ] Displays address selection
- [ ] Displays payment methods
- [ ] Shows order summary
- [ ] Creates order on payment
- [ ] Handles Razorpay modal
- [ ] Verifies payment signature
- [ ] Clears cart after success
- [ ] Shows errors appropriately

### Order Page (`app/orders/[id]/page.tsx`)
- [ ] Requires authentication
- [ ] Loads order data via API
- [ ] Displays success message if needed
- [ ] Shows order status
- [ ] Shows timeline
- [ ] Lists items correctly
- [ ] Displays address
- [ ] Shows total amount
- [ ] Has working links
- [ ] Handles errors (404, etc.)

---

## Deployment Steps

### Step 1: Code Push
```bash
git add .
git commit -m "feat: implement Zustand cart and Razorpay checkout"
git push origin main
```

- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Pushed to main branch

### Step 2: Vercel Deploy
- [ ] Vercel CI/CD triggered
- [ ] Build succeeds
- [ ] No build errors
- [ ] Preview URL generated

### Step 3: Database Migration
```bash
# Connect to production database
psql $DATABASE_URL -f scripts/002-create-orders-tables.sql
```

- [ ] Migration executed successfully
- [ ] Tables created
- [ ] No errors in migration

### Step 4: Environment Variables
- [ ] Log into Vercel project settings
- [ ] Add all required environment variables
- [ ] Verify secret variables are marked as sensitive
- [ ] Redeploy after adding env vars

### Step 5: Production Deployment
- [ ] Production deployment triggered
- [ ] Build succeeds in production
- [ ] No build errors
- [ ] No runtime errors
- [ ] All env vars available

---

## Post-Deployment Testing

### Smoke Tests
- [ ] Website loads without errors
- [ ] Header displays correctly
- [ ] Navigation works
- [ ] Pages are accessible

### Cart Tests
- [ ] Add item to cart
- [ ] Cart updates in real-time
- [ ] Quantity changes work
- [ ] Remove item works
- [ ] Cart persists on refresh

### Checkout Tests
- [ ] Can navigate to checkout
- [ ] Addresses load from database
- [ ] Can select address
- [ ] Can select payment method
- [ ] Order summary displays

### Payment Tests
- [ ] Razorpay modal opens
- [ ] Can enter test payment details
- [ ] Payment processes successfully
- [ ] Order created in database
- [ ] Order status is 'paid'
- [ ] Redirects to confirmation page

### COD Tests
- [ ] Can select Cash on Delivery
- [ ] Order created with status 'confirmed'
- [ ] Redirects to confirmation page

### Order Confirmation
- [ ] Order page loads
- [ ] Success message displays
- [ ] All order details correct
- [ ] Links work

### API Tests
- [ ] Order API returns data
- [ ] Verification API works
- [ ] Address API still works
- [ ] All API errors handled

---

## Monitoring & Verification

### Application Monitoring
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Response times acceptable (<2s)
- [ ] Database queries performant

### Payment Monitoring
- [ ] Check Razorpay dashboard
- [ ] Verify test payments recorded
- [ ] Check payment success rate
- [ ] Monitor failed payments
- [ ] Verify no duplicate payments

### Database Monitoring
- [ ] Check order creation rate
- [ ] Monitor table sizes
- [ ] Check query performance
- [ ] Verify no data corruption
- [ ] Backup automated

### Error Tracking (if configured)
- [ ] No errors in error tracking dashboard
- [ ] All errors properly logged
- [ ] Notifications working

---

## Documentation

### Public Documentation
- [ ] README updated with new features
- [ ] Deployment guide created
- [ ] User documentation clear
- [ ] Screenshots/examples provided

### Developer Documentation
- [ ] Code comments clear
- [ ] Function documentation complete
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Setup guide comprehensive

---

## Rollback Plan

### If Something Goes Wrong
- [ ] Keep previous Vercel deployment history
- [ ] Have database backup available
- [ ] Know how to rollback Vercel deployment
- [ ] Have emergency contact numbers ready

### Rollback Steps
1. [ ] Revert code: `git revert <commit-hash>`
2. [ ] Redeploy old version
3. [ ] Restore database from backup if needed
4. [ ] Notify team of issues

---

## Post-Launch Tasks

### First Week
- [ ] Monitor error logs daily
- [ ] Check payment success rates
- [ ] Verify order creation metrics
- [ ] Get user feedback
- [ ] Fix any critical bugs
- [ ] Update documentation with findings

### First Month
- [ ] Optimize based on user behavior
- [ ] Add analytics tracking
- [ ] Plan feature enhancements
- [ ] Document lessons learned
- [ ] Plan next iteration

### Ongoing
- [ ] Regular security audits
- [ ] Performance monitoring
- [ ] User feedback integration
- [ ] Bug fixes and patches
- [ ] Feature improvements

---

## Sign-Off

| Role | Name | Date | Sign-Off |
|------|------|------|----------|
| Developer | _______ | _______ | ☐ |
| QA Tester | _______ | _______ | ☐ |
| DevOps | _______ | _______ | ☐ |
| Product | _______ | _______ | ☐ |

---

## Notes

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Version:** 1.0
**Last Updated:** 2024
**Status:** Ready for Deployment
