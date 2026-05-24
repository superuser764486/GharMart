# GharMart Platform - Quick Start Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Git (for version control)

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/superuser764486/GharMart.git
cd GharMart

# Install dependencies
pnpm install
```

## Step 2: Setup Environment Variables

Create `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gharmart

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_jwt_secret_key_min_32_chars_long_here
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_here
OTP_EXPIRY_MINUTES=10

# Email Configuration (using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Step 3: Setup Database

```bash
# Create PostgreSQL database
createdb gharmart

# Run migrations (in order)
psql -U postgres -d gharmart -f scripts/01-create-schema.sql
psql -U postgres -d gharmart -f scripts/02-create-orders-tables.sql
psql -U postgres -d gharmart -f scripts/03-create-categories.sql
psql -U postgres -d gharmart -f scripts/04-reviews-table.sql
psql -U postgres -d gharmart -f scripts/05-customer-schema-upgrade.sql
psql -U postgres -d gharmart -f scripts/06-inventory-and-shops.sql
psql -U postgres -d gharmart -f scripts/07-order-tracking-migration.sql
psql -U postgres -d gharmart -f scripts/08-product-reviews-migration.sql
```

## Step 4: Run Development Server

```bash
# Start the dev server
pnpm dev

# Server will run on http://localhost:3000
```

## Step 5: Test the Application

### Authentication Flow
1. Go to http://localhost:3000/auth/signup
2. Register with email & password
3. Receive OTP verification email
4. Verify email with OTP
5. Login with credentials

### Shopping Flow
1. Browse products at `/products`
2. View product details at `/products/[slug]`
3. Add items to cart at `/cart`
4. Proceed to checkout at `/checkout`
5. Select address and payment method
6. Complete payment (Razorpay test mode)

### Order Tracking
1. Go to `/orders` to view all orders
2. Click on order to see details and live tracking
3. Track real-time status updates

### Leave Reviews
1. Go to `/customer/reviews` to manage your reviews
2. Submit reviews on product pages
3. Rate and vote on helpful reviews

## Key Directories

```
├── /app                    - Next.js pages and API routes
├── /components             - Reusable React components
├── /lib                    - Utilities, database, auth logic
├── /scripts                - Database migration SQL files
├── /public                 - Static assets
└── /styles                 - Global CSS
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP

### Products
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Get single product
- `GET /api/products/[id]/reviews` - Get product reviews

### Orders
- `GET /api/customer/orders` - List user's orders
- `GET /api/customer/orders/[id]/status` - Get order details
- `POST /api/orders` - Create new order

### Reviews
- `GET /api/products/[id]/reviews` - Get reviews for product
- `POST /api/customer/reviews` - Submit review
- `DELETE /api/customer/reviews/[id]` - Delete review
- `POST /api/reviews/[id]/vote` - Vote on review helpfulness

### Addresses
- `GET /api/addresses` - List user's addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/[id]` - Update address
- `DELETE /api/addresses/[id]` - Delete address

## Deployment

### Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings > Environment Variables
```

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure production database URL
- [ ] Setup email with real SMTP provider
- [ ] Get Razorpay production credentials
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure error tracking (Sentry)
- [ ] Setup monitoring dashboard
- [ ] Test payment flow end-to-end
- [ ] Load test the application

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Reset DATABASE_URL in .env.local
# Format: postgresql://user:password@host:port/database
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Port Already in Use
```bash
# Run on different port
pnpm dev -p 3001
```

### Email Not Sending
- Check SMTP credentials in .env.local
- Enable "Less secure app access" for Gmail
- Or use app-specific password
- Check email service logs

## Performance Tips

1. **Database**: Use connection pooling (already configured)
2. **Caching**: Implement Redis for sessions and cart
3. **Images**: Optimize with Next.js Image component
4. **Search**: Add full-text search index to products table
5. **API**: Use pagination for list endpoints

## Security Best Practices

1. Never commit `.env.local` to git
2. Use HTTPS in production
3. Validate all user inputs
4. Use prepared statements (already done)
5. Keep dependencies updated
6. Enable CORS only for trusted origins
7. Rate limit authentication endpoints
8. Use strong JWT secrets (min 32 characters)

## Support

For issues or questions:
1. Check existing documentation files
2. Review error messages in browser console
3. Check server logs: `pnpm dev` output
4. Review database queries in logs
5. Check `.env.local` configuration

Happy building! 🚀
