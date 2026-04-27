# GharMart - Tech Stack Quick Reference

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  React 19 + Next.js 16 + Tailwind CSS + Radix UI           │
│  State: Zustand (cart), Context (auth), SWR (data)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│      Next.js API Routes (Node.js Serverless)               │
│  REST Endpoints: /api/auth, /api/products, /api/orders    │
│  Authentication: JWT (15m access, 7d refresh tokens)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  • Payments: Razorpay (Credit/Debit/UPI/Wallet)           │
│  • Email: Nodemailer (SMTP - Gmail/Custom)                │
│  • Authentication: JWT + bcryptjs + Supabase Auth         │
│  • Security: Parameterized queries, HMAC signature verify │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│          PostgreSQL (Connection Pool: 20 max)              │
│  Tables: users, products, orders, shops, addresses...      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   HOSTING LAYER                             │
│  Frontend & Backend: Vercel (Serverless Functions)         │
│  Database: PostgreSQL (Cloud)                              │
│  CDN: Vercel Edge Network (Global)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Technology Summary Table

| Layer | Component | Technology | Version | Purpose |
|-------|-----------|-----------|---------|---------|
| **Frontend** | Framework | Next.js | 16.2.4 | Full-stack framework |
| | Language | TypeScript | 5.7.3 | Type safety |
| | UI Library | React | 19 | Component library |
| | Styling | Tailwind CSS | 4.2.0 | Utility-first CSS |
| | Components | Radix UI + shadcn/ui | Latest | Accessible UI components |
| | State (Cart) | Zustand | 5.0.12 | State management |
| | State (Form) | React Hook Form | 7.54.1 | Form handling |
| | Data Fetching | SWR | 2.4.1 | Client-side caching |
| | HTTP | Axios | 1.15.2 | API requests |
| | Validation | Zod | 3.24.1 | Schema validation |
| | Icons | Lucide React | 0.564.0 | 280+ SVG icons |
| | Charts | Recharts | 2.15.0 | Data visualization |
| | Notifications | Sonner | 1.7.1 | Toast notifications |
| | Dates | date-fns | 4.1.0 | Date utilities |
| **Backend** | Runtime | Node.js | Latest | JavaScript runtime |
| | Framework | Next.js API Routes | 16.2.4 | Serverless backend |
| | Auth | JWT | Custom | Token-based auth |
| | Password | bcryptjs | 3.0.3 | Password hashing |
| | Email | Nodemailer | 8.0.6 | SMTP email service |
| | Payments | Razorpay SDK | 2.9.6 | Payment processing |
| | Database Client | pg | 8.20.0 | PostgreSQL driver |
| | OTP | otplib | 13.4.0 | OTP generation |
| | Encryption | crypto-js | 4.2.0 | Cryptographic functions |
| **Database** | Engine | PostgreSQL | 12+ | Relational database |
| | Connection Pool | pg Pool | Built-in | Max 20 connections |
| | Query Language | SQL | Standard | Data queries |
| **Hosting** | Frontend | Vercel | - | Edge computing |
| | Backend | Vercel Functions | - | Serverless functions |
| | Database | Cloud PostgreSQL | - | Managed database |
| | CDN | Vercel Edge Network | - | Global content delivery |
| **Integrations** | Payments | Razorpay | 2.9.6 | Payment gateway |
| | Auth (Optional) | Supabase | ^2.104.1 | Auth provider |
| | Email | Custom SMTP | - | Gmail / custom mail server |
| **DevOps** | Version Control | Git + GitHub | - | Code management |
| | CI/CD | Vercel Auto-Deploy | - | Auto deployment |
| | Environment | Vercel Env Vars | - | Config management |
| | Monitoring | Vercel Logs | - | Basic logging |

---

## 🔐 Security Technologies

| Feature | Technology | Implementation |
|---------|-----------|-----------------|
| **Authentication** | JWT | 15-min access token, 7-day refresh token |
| **Password** | bcryptjs | 10 salt rounds |
| **API Security** | Parameterized Queries | All SQL queries use $1, $2 parameters |
| **Payment** | HMAC-SHA256 | Razorpay signature verification |
| **Session** | HTTP-Only Cookies | Prevents XSS access to tokens |
| **Data Validation** | Zod + Validation | Input sanitization on all endpoints |
| **HTTPS** | TLS 1.2+ | Vercel enforced SSL |

---

## 📊 Key Features by Technology

### Product Search & Browsing
- **Technology**: Next.js, PostgreSQL, SWR
- **Features**: 
  - Product listing with pagination
  - Category filtering
  - Search (LIKE queries)
  - Product details with images
  - Ratings and reviews

### Shopping Cart
- **Technology**: Zustand, SWR, Axios
- **Features**:
  - Add/remove items
  - Update quantities
  - Persistent cart (localStorage)
  - Real-time total calculation
  - Promo code validation

### Checkout & Orders
- **Technology**: React Hook Form, Zod, Razorpay, Next.js
- **Features**:
  - Address selection/creation
  - Payment method selection
  - Razorpay integration
  - Signature verification
  - Order confirmation

### Order Tracking
- **Technology**: SWR, PostgreSQL, Next.js API
- **Features**:
  - Order history with pagination
  - Status tracking (5-step timeline)
  - Real-time updates (5-second refresh)
  - Detailed order information
  - Invoice download

### User Management
- **Technology**: JWT, bcryptjs, PostgreSQL, Nodemailer
- **Features**:
  - Sign up / Sign in
  - Email verification (OTP)
  - Password reset
  - Profile management
  - Address management

### Admin/Vendor Dashboard
- **Technology**: Recharts, Next.js, PostgreSQL
- **Features**:
  - Sales analytics
  - Order management
  - Inventory management
  - Shop details

---

## 🚀 Performance Optimizations

| Optimization | Technology | Benefit |
|--------------|-----------|---------|
| **Code Splitting** | Next.js | Smaller JavaScript bundles |
| **Image Optimization** | Next.js Image | WebP format, lazy loading |
| **Data Caching** | SWR | Reduces API calls |
| **State Efficiency** | Zustand | Minimal re-renders |
| **Database Pooling** | pg Pool | Reuses connections |
| **Minification** | Tailwind CSS | 15KB production bundle |
| **Edge Caching** | Vercel CDN | Global distribution |
| **Connection Reuse** | HTTP Keep-Alive | Reduces latency |

---

## 💾 Database Schema Overview

```
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── name (VARCHAR)
├── phone (VARCHAR)
├── user_type (ENUM: customer, vendor)
├── address (TEXT)
├── city (VARCHAR)
├── pincode (VARCHAR)

products
├── id (UUID, PK)
├── name (VARCHAR)
├── description (TEXT)
├── price (DECIMAL)
├── discount_percentage (DECIMAL)
├── category_id (FK)
├── image_url (VARCHAR)
├── stock_quantity (INTEGER)
├── is_active (BOOLEAN)

orders
├── id (UUID, PK)
├── customer_id (FK -> users)
├── status (ENUM: pending, confirmed, paid, shipped, delivered)
├── total_amount (DECIMAL)
├── payment_method (VARCHAR)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)

order_items
├── id (UUID, PK)
├── order_id (FK)
├── product_id (FK)
├── quantity (INTEGER)
├── price_at_purchase (DECIMAL)

addresses
├── id (UUID, PK)
├── customer_id (FK)
├── full_name (VARCHAR)
├── phone (VARCHAR)
├── street_address (TEXT)
├── city (VARCHAR)
├── state (VARCHAR)
├── postal_code (VARCHAR)
├── is_default (BOOLEAN)
```

---

## 🔄 API Endpoint Summary

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/reset-password` - Password reset request

### Products
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product details
- `GET /api/categories` - List categories

### Orders
- `GET /api/customer/orders` - List user orders
- `GET /api/customer/orders/[id]/status` - Order details & tracking
- `POST /api/orders` - Create order (checkout)
- `POST /api/orders/verify-payment` - Verify Razorpay payment

### Addresses
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/[id]` - Update address
- `DELETE /api/addresses/[id]` - Delete address

### Cart
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/remove` - Remove from cart
- `GET /api/cart` - Get cart items

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

---

## 📦 Dependency Breakdown by Size

| Package | Size | Purpose |
|---------|------|---------|
| next | 10+ MB | Framework |
| react | 5+ MB | UI library |
| postgres (pg) | 500 KB | Database driver |
| tailwindcss | 1+ MB | CSS framework |
| zustand | 3 KB | State management |
| zod | 150 KB | Validation |
| recharts | 300 KB | Charts |
| radix-ui (all) | 2+ MB | Components |
| lucide-react | 500 KB | Icons |

**Total Bundle**: ~80 MB (development), ~15-20 MB (production after minification)

---

## 🎯 Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Authentication
SESSION_SECRET=your-jwt-secret-key

# Email Service
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@gharmart.com

# Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Frontend
NEXT_PUBLIC_API_URL=https://gharmart.com
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Node
NODE_ENV=production
```

---

## 📈 Scalability Rating by Component

| Component | Current | With Optimization | Enterprise |
|-----------|---------|------------------|------------|
| **Frontend** | 1K users | 100K users | 1M+ users |
| **Backend (API)** | 1K req/sec | 10K req/sec | 100K+ req/sec |
| **Database** | 10K rows | 1M rows | 1B+ rows |
| **File Storage** | 10K files | 1M files | 1B+ files |
| **Email** | 100/day | 10K/day | 1M/day |

---

## 🛠️ Development & Deployment

### Development
```bash
pnpm install       # Install dependencies
pnpm run dev       # Start dev server (localhost:3000)
pnpm run build     # Create production build
pnpm run start     # Start production server
pnpm run lint      # Run ESLint
```

### Deployment
- **Git Push to GitHub** → **Auto-triggered Vercel Deploy** → **Production Live**
- Deployment time: ~2-3 minutes
- Automatic rollback available

---

## ⚠️ Known Limitations & TODOs

1. **Local File Storage**: Images stored locally (not scalable)
   - TODO: Migrate to AWS S3 or Vercel Blob

2. **Synchronous Email**: Email sent inline
   - TODO: Implement message queue (Bull/RabbitMQ)

3. **LIKE Queries**: Search uses LIKE (inefficient at scale)
   - TODO: Implement PostgreSQL Full-Text Search or Elasticsearch

4. **No Rate Limiting**: Missing API rate limiting
   - TODO: Add `@vercel/rate-limit` middleware

5. **No Error Tracking**: Only console.log currently
   - TODO: Integrate Sentry or similar

6. **No Real-time Updates**: Order tracking uses polling
   - TODO: Implement WebSockets or Server-Sent Events

7. **No Caching Layer**: Missing Redis
   - TODO: Add Upstash Redis for session/data caching

---

## ✅ Production Readiness Checklist

- ✅ HTTPS/TLS enabled
- ✅ JWT authentication
- ✅ Password hashing
- ✅ SQL injection prevention
- ✅ Payment signature verification
- ⚠️ Rate limiting
- ⚠️ Error tracking
- ⚠️ Performance monitoring
- ⚠️ Caching layer
- ⚠️ Backup strategy

**Overall Production Readiness: 7/10** (Good foundation, needs optimization for scale)

