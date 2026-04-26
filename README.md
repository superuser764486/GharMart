# GharMart - Hyperlocal Marketplace

A full-stack Next.js 16 application for discovering and ordering from local shops in your neighborhood. Built with Supabase, Tailwind CSS, and real database functionality.

## Features

### Core Features
- **Shop Discovery**: Browse local shops filtered by category, location, and ratings
- **Product Catalog**: View products from each shop with details and reviews
- **Shopping Cart & Checkout**: Add items to cart and place orders with Cash on Delivery (COD)
- **Order Tracking**: Track your orders from pending to delivery
- **Reviews & Ratings**: Read and submit reviews for shops
- **User Authentication**: Three-tier system: Customer, Vendor, Admin

### Customer Features
- Sign up and create a profile
- Browse shops and products
- Filter shops by category and rating
- View shop details and reviews
- Add items to cart and checkout
- Place orders with delivery address
- Track order status
- Leave reviews for shops
- Manage profile and address

### Vendor Features
- Sign up as a shop owner
- Manage shop information
- Add and manage products
- View incoming orders
- Update order status (Pending → Confirmed → Preparing → On Way → Delivered)
- View order analytics and revenue
- Manage product inventory

### Admin Features
- Dashboard with platform statistics
- Monitor shops and users
- View platform-wide orders and revenue
- Manage shop approvals

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Fetching**: SWR

## Project Structure

```
/app
  /api                      # API routes
  /auth                      # Authentication pages
    /signup
    /signin
  /shops                     # Shop browsing
    /page.tsx              # Shop listing with filters
    /[id]/page.tsx         # Shop detail page
  /categories                # Category browsing
  /checkout                  # Checkout flow
  /orders                    # Order management
  /profile                   # User profile
  /vendor
    /dashboard              # Vendor dashboard
    /products              # Product management
  /admin
    /dashboard              # Admin dashboard
  /page.tsx                 # Home page
  /layout.tsx               # Root layout

/components
  /Header.tsx               # Main navigation header
  /ui                       # shadcn/ui components

/lib
  /supabase.ts             # Database types and client
  /auth.ts                 # Authentication utilities
  /shops.ts                # Shop-related queries
  /products.ts             # Product-related queries
  /orders.ts               # Order management
  /reviews.ts              # Review functionality

/scripts
  /01-create-schema.sql    # Database schema
  /02-seed-data.sql        # Sample data
  /setup-db.js             # Database setup script
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
SUPABASE_JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Database Schema

The database schema is defined in `/scripts/01-create-schema.sql`. Execute it in your Supabase SQL editor:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `/scripts/01-create-schema.sql`
5. Execute the query

### 4. Seed Sample Data

Execute the seed script in Supabase SQL editor:

1. Copy the contents of `/scripts/02-seed-data.sql`
2. Execute it in the SQL editor

This creates:
- 12 product categories
- 10 sample vendors with shops
- 60+ products
- 3 sample customers with reviews

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to view the application.

## Demo Credentials

After running the seed script, use these credentials to test:

### Customer
- Email: `customer1@gharmart.com`
- Password: Use any password (auth will work after signing up)

### Vendor
- Email: `vendor1@gharmart.com`
- Password: Use any password (auth will work after signing up)

### Admin
- Email: `admin@gharmart.com`
- Password: Use any password (auth will work after signing up)

## Key Features by Page

### Homepage (`/`)
- Hero section with search functionality
- Popular shops carousel
- Product categories grid
- Why Choose GharMart section
- Footer with links

### Shop Listing (`/shops`)
- Search shops by name
- Filter by category
- Filter by minimum rating
- Sort by rating or delivery time
- Display shop cards with info

### Shop Detail (`/shops/[id]`)
- Full shop information
- Product listing with add to cart
- Reviews section
- Leave review form
- Shopping cart sidebar

### Checkout (`/checkout`)
- Multi-step checkout (Address → Payment → Confirm)
- Delivery address form
- COD payment method info
- Order confirmation

### Orders (`/orders`)
- List all customer orders
- View order status
- Cancel pending orders
- Order history with timestamps

### Vendor Dashboard (`/vendor/dashboard`)
- Key metrics (total orders, revenue, pending)
- Recent orders list
- Order status management
- Link to product management

### Admin Dashboard (`/admin/dashboard`)
- Platform statistics
- Top shops listing
- User count
- Total revenue

## Database Schema

### Main Tables

**users** - User profiles (customers, vendors, admins)
- id, email, phone, name, address, pincode, city
- user_type: 'customer' | 'vendor' | 'admin'

**shops** - Shop information
- id, vendor_id, name, category, address, location (lat/long)
- delivery_time_min/max, delivery_radius_km
- is_active, is_new, avg_rating, total_reviews

**products** - Shop products
- id, shop_id, vendor_id, name, price, quantity, category
- is_available

**orders** - Customer orders
- id, user_id, shop_id, vendor_id, total_amount
- status: 'pending' | 'confirmed' | 'preparing' | 'on_way' | 'delivered' | 'cancelled'
- delivery_address, pincode, delivery_time_estimate

**order_items** - Individual items in orders
- id, order_id, product_id, quantity, price_at_purchase

**reviews** - Shop reviews
- id, shop_id, user_id, rating (1-5), comment

**categories** - Product categories
- id, name, icon_url, description

**admin_users** - Admin profiles
- id, user_id, role: 'moderator' | 'manager' | 'super_admin'

## RLS (Row Level Security) Policies

All tables have RLS enabled with the following policies:

- **Users**: Can view own profile, vendors can view other vendors (read-only), admins see all
- **Shops**: Public read access to active shops, vendors can manage own
- **Products**: Public read access to available products, vendors manage own
- **Orders**: Customers see own orders, vendors see their orders, admins see all
- **Reviews**: Public read, users can create/edit/delete own reviews

## API Endpoints

### Health Check
- `GET /api/health` - Check database connection

## Geolocation

The app uses the browser's Geolocation API to automatically detect user location. If geolocation is disabled or unavailable, users can enter a pincode manually for location-based shop discovery.

## Payment Method

Currently, **Cash on Delivery (COD)** is the only payment method. Orders are created with a pending status and can be updated by vendors through the dashboard.

## Future Enhancements

- [ ] Stripe/Razorpay integration for online payments
- [ ] Real-time order updates using Supabase subscriptions
- [ ] Image uploads for products and shops
- [ ] Advanced analytics dashboard
- [ ] Delivery person tracking
- [ ] Push notifications for order updates
- [ ] Multi-language support
- [ ] Rating and review moderation
- [ ] Vendor analytics and reports
- [ ] Loyalty rewards program

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel settings
4. Deploy

```bash
# Environment variables needed in Vercel:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Development Notes

- The app uses SWR for client-side data fetching and caching
- All database queries use Supabase client with proper RLS policies
- Authentication is handled by Supabase Auth
- Responsive design with mobile-first approach
- Dark mode support via Tailwind CSS

## Troubleshooting

### Database Connection Error
- Check if Supabase environment variables are correctly set
- Verify database is accessible
- Check RLS policies are not blocking queries

### Authentication Issues
- Clear browser cookies and local storage
- Check Supabase Auth settings
- Ensure JWT secret is configured

### Location Not Detected
- Check browser geolocation permissions
- Try entering pincode manually
- Ensure HTTPS is used (geolocation requires secure context)

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and Supabase
