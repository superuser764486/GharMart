# GharMart - Complete Technology Stack Breakdown

## Executive Summary

GharMart is a modern, full-stack e-commerce platform for grocery and daily essentials delivery. The platform is built using a **Next.js/React frontend** with **Node.js backend**, **PostgreSQL database**, and integrates multiple third-party services for payments, email, and authentication.

---

## 1. FRONTEND STACK

### Framework & Runtime
- **Next.js 16.2.4** (React 19)
  - **Why**: Full-stack JavaScript framework with server-side rendering (SSR), static site generation (SSG), and API routes. Enables fast performance, better SEO, and unified codebase for frontend and backend.
  - **Scalability**: Excellent for production. Turbopack (default bundler in v16) provides fast builds. Vercel hosting is optimized for Next.js.

### UI Library
- **React 19**
  - Latest React with improved hooks and performance optimizations
  - Works with Radix UI and shadcn/ui component system

### Component Library
- **Radix UI** (30+ components)
  - Headless, unstyled accessible components
  - Covers: Buttons, Dialogs, Dropdowns, Tabs, Accordions, Popovers, Tooltips, etc.
  
- **shadcn/ui** (copy-paste component library)
  - Pre-built Radix UI + Tailwind CSS components
  - Customizable and lightweight

### Styling
- **Tailwind CSS v4.2.0**
  - Utility-first CSS framework
  - Zero JavaScript overhead
  - Responsive design with mobile-first approach
  - Custom theming system via CSS custom properties
  - **Why**: Fast development, consistent design system, excellent mobile support
  - **Scalability**: Highly scalable, used by enterprises like Shopify, Vercel, etc.

### State Management
- **Zustand v5.0.12**
  - Lightweight state management (3KB)
  - Used for: Cart state management
  - **Why**: Simple, performant, no boilerplate (vs Redux/Context)
  - **Alternative in use**: React Context API for auth state

- **React Hook Form v7.54.1**
  - Form state management with minimal re-renders
  - Validation with Zod integration

### HTTP Client & Data Fetching
- **SWR v2.4.1** (Stale-While-Revalidate)
  - Client-side data fetching with caching
  - Auto-revalidation and background sync
  - Perfect for fetching orders, products, user data

- **Axios v1.15.2**
  - Promise-based HTTP client
  - Used for API requests

### Form Validation
- **Zod v3.24.1**
  - TypeScript-first schema validation
  - Used for: Sign up/sign in forms, checkout forms

- **React Hook Form Resolvers**
  - Integrates Zod with React Hook Form

### UI Utilities
- **Lucide React v0.564.0** (280+ icons)
  - SVG-based icon library
  - Used throughout the app for visual indicators

- **Date-fns v4.1.0**
  - Lightweight date utility library
  - Used for: Order dates, timestamps

- **Recharts v2.15.0**
  - React chart library for data visualization
  - Used for: Analytics dashboards, sales charts

- **Sonner v1.7.1**
  - Toast notification library
  - Used for: Success/error messages

- **Embla Carousel v8.6.0**
  - Carousel component for product images

### Theme Management
- **next-themes v0.4.6**
  - Dark/light mode support
  - Persists theme preference

### Utilities
- **clsx v2.1.1** - Class name utility
- **tailwind-merge v3.3.1** - Merges Tailwind classes intelligently
- **class-variance-authority v0.7.1** - CSS-in-JS patterns for components
- **js-cookie v3.0.5** - Cookie management
- **crypto-js v4.2.0** - Cryptographic operations

---

## 2. BACKEND STACK

### Runtime & Framework
- **Node.js** (via Next.js API Routes)
  - **Why**: JavaScript full-stack, single language across frontend and backend, rich ecosystem
  - **Scalability**: Very scalable with proper architecture

- **Next.js API Routes (Next.js 16)**
  - Serverless functions at `/app/api/` directory
  - Auto-generated REST endpoints
  - **Why**: Zero-configuration backend, integrates seamlessly with frontend
  - **Scalability**: Runs on Vercel's edge network, auto-scales

### API Type
- **REST API**
  - Endpoints for: Authentication, Orders, Products, Addresses, Cart, Users, Payments
  - Standard HTTP methods: GET, POST, PUT, DELETE
  - JSON request/response format

### Key Backend Libraries
- **jsonwebtoken v9.0.3**
  - JWT token generation and verification
  - Token expiry: 15 minutes (access token), 7 days (refresh token)

- **bcryptjs v3.0.3**
  - Password hashing with bcrypt algorithm
  - Used for: Secure password storage

- **pg v8.20.0** (PostgreSQL client)
  - Native PostgreSQL driver
  - Connection pooling (20 max connections)
  - Used for all database queries

- **nodemailer v8.0.6**
  - Email sending library
  - SMTP support for Gmail, custom email providers
  - Email templates for: OTP, password reset, order confirmations

- **razorpay v2.9.6**
  - Razorpay payment gateway SDK
  - Payment creation, verification, refunds

- **otplib v13.4.0**
  - OTP generation and verification
  - Used for: 2FA, email verification

---

## 3. DATABASE STACK

### Database Engine
- **PostgreSQL**
  - **Why**: Robust ACID compliance, JSON support, excellent for complex queries, open-source
  - **Scalability**: Enterprise-grade, powers major platforms like Spotify, Instagram, Dropbox

### Database Hosting
- **PostgreSQL (self-hosted or cloud)**
  - Database URL provided via `DATABASE_URL` environment variable
  - Connection string format: `postgresql://user:password@host:port/dbname`

### Connection Management
- **pg Pool**
  - Connection pooling
  - Max connections: 20
  - Idle timeout: 30 seconds
  - Connection timeout: 2 seconds

### Database Schema
Tables include:
- `users` - Customer and vendor profiles
- `products` - Product catalog
- `categories` - Product categories
- `shops` - Vendor shop information
- `orders` - Customer orders
- `order_items` - Items within orders
- `cart_items` - Shopping cart items
- `customer_addresses` - Delivery addresses
- `auth_users` - Authentication data (if using separate auth DB)

### Query Execution
- Raw SQL queries with parameterized statements
- Transaction support for ACID compliance
- Query logging for debugging

---

## 4. AUTHENTICATION & SECURITY

### Authentication Method
- **JWT (JSON Web Tokens)**
  - Access token: 15-minute expiry
  - Refresh token: 7-day expiry
  - Tokens stored in HTTP-only cookies
  - Secret key: `SESSION_SECRET` environment variable

- **Hybrid Auth System**
  - Supabase Auth for optional social authentication
  - Custom JWT authentication for API routes
  - Session-based authentication via cookies

### Password Security
- **bcryptjs**
  - Passwords hashed with bcrypt (10 salt rounds)
  - Salted hash prevents rainbow table attacks

### Role-Based Access Control (RBAC)
- **Roles**: `customer`, `vendor`, `admin`
- Implemented in JWT payload
- Checked in API routes to restrict access

### Additional Security Features
- **SQL Injection Prevention**: Parameterized queries with pg
- **CSRF Protection**: Implicit via SameSite cookies
- **XSS Protection**: React's built-in escaping
- **Email Verification**: OTP verification using otplib
- **Password Reset**: Email-based password reset flow

---

## 5. FILE STORAGE & MEDIA

### Image Storage
- **URLs stored in database**
  - Product images: `image_url` field in products table
  - User avatars: Potential avatar_url field in users table

### Supported Methods
1. **Local Storage** (current setup)
   - Images served from `/public` directory
   - Limited scalability (not suitable for millions of images)

2. **Cloud Storage Recommendations**
   - **AWS S3**: Scalable, cost-effective, global CDN
   - **Cloudinary**: Optimized for images, transforms, resizing
   - **Firebase Storage**: Integrated with authentication
   - **Vercel Blob**: Native integration with Vercel

### Current Implementation
- Product images: Referenced by URL paths in database
- No file upload API currently exposed
- Images can be added via database migrations or admin panel

---

## 6. PAYMENTS

### Payment Gateway
- **Razorpay**
  - Supports: Credit cards, debit cards, UPI, wallets, net banking
  - Live test environment available
  - **Why**: Popular in India (GharMart target market), easy integration, good documentation

### Payment Flow
1. **Frontend**: User selects payment method at checkout
2. **Backend**: `POST /api/orders` creates order and generates Razorpay order
3. **Frontend**: Opens Razorpay modal
4. **User**: Completes payment in modal
5. **Backend**: Signature verification via `POST /api/orders/verify-payment`
6. **Security**: HMAC-SHA256 signature validation

### Integration Details
- **Razorpay Key ID**: `RAZORPAY_KEY_ID` (public key)
- **Razorpay Secret**: `RAZORPAY_KEY_SECRET` (private key, server-side only)
- Signature verification prevents tampering

### Supported Payment Methods
- Credit/Debit Cards
- UPI (Google Pay, PhonePe, Paytm)
- Razorpay Wallet
- Net Banking
- Cash on Delivery (no payment required)

---

## 7. NOTIFICATIONS

### Email Service
- **Nodemailer**
  - Protocol: SMTP
  - Supports: Gmail, custom SMTP servers

### Email Configuration
```
EMAIL_SERVICE: Service name (default: gmail)
EMAIL_HOST: SMTP server hostname
EMAIL_PORT: SMTP port (usually 587 for TLS)
EMAIL_SECURE: TLS flag (true/false)
EMAIL_USER: SMTP username
EMAIL_PASSWORD: SMTP password
EMAIL_FROM: Sender email address
```

### Email Templates
- **Welcome Email**: New user sign-up confirmation
- **OTP Email**: Email verification code
- **Password Reset**: Reset link with expiry
- **Order Confirmation**: Order summary and details
- **Order Status Update**: Status change notifications
- **Delivery Notification**: Out for delivery alert

### SMS Service
- **Not currently integrated**
- Recommendation: Twilio, AWS SNS, or MSG91 for Indian market

### Push Notifications
- **Not currently implemented**
- Recommendation: Firebase Cloud Messaging (FCM) for app notifications

---

## 8. MAPS & LOCATION

### Current Implementation
- **Latitude/Longitude storage** for shops and delivery addresses
- Coordinates stored in database for filtering nearby shops

### Location Features
- **Shop location data**: `latitude`, `longitude` in shops table
- **Address geocoding**: Could integrate Google Maps API
- **Nearby shop filtering**: SQL distance queries using PostGIS extension

### Recommendations for Enhancement
- **Google Maps API**: Integrate for address search, map display, directions
- **PostGIS**: PostgreSQL extension for geographic queries
- **Mapbox**: For interactive delivery tracking maps
- **OpenStreetMap**: Free alternative to Google Maps

---

## 9. DEPLOYMENT & HOSTING

### Frontend Hosting
- **Vercel**
  - Hosts Next.js application
  - Zero-config deployment from GitHub
  - Edge Functions support
  - CDN global distribution
  - Auto-scaling, SSL/TLS included
  - **Project ID**: prj_xfkyenUPnj6wucQnisj3YoiML00J

### Backend Hosting
- **Vercel API Routes** (serverless)
  - Deployed alongside frontend
  - Functions in `/app/api` directory
  - Auto-scaled, pay-per-use model
  - Cold start time: ~100-300ms

### Database Hosting
- **Self-hosted or Cloud Database**
  - Connection string via `DATABASE_URL`
  - Options:
    - **Neon**: PostgreSQL serverless (recommended for Vercel)
    - **Supabase**: PostgreSQL + Auth + Storage
    - **RDS (AWS)**: Managed PostgreSQL
    - **DigitalOcean**: Affordable managed PostgreSQL
    - **Heroku Postgres**: Legacy, being phased out

### Environment Management
- **Vercel Environment Variables**
  - Stored in Vercel dashboard
  - Auto-injected into functions
  - Separate configs for: Development, Preview, Production
  - Variables: DATABASE_URL, EMAIL_*, RAZORPAY_*, SESSION_SECRET

### Git Workflow
- **GitHub Repository**
  - Connected to Vercel
  - Auto-deploy on push to main
  - Preview deployments for pull requests
  - Organization: superuser764486
  - Repository: GharMart
  - Base Branch: main

### Build & Runtime
- **Build Command**: `next build`
- **Start Command**: `next start` (production) or `next dev` (development)
- **Build Time**: ~1-2 minutes
- **Runtime**: Node.js 18+ on Vercel

---

## 10. ANALYTICS & MONITORING

### Error Tracking
- **Server Logs**: Vercel project logs
- **Console Logging**: `console.log()` in server functions
- **Recommendations**:
  - **Sentry**: Error tracking and performance monitoring
  - **LogRocket**: Session replay and error detection
  - **New Relic**: Full observability stack

### Analytics Tools
- **Vercel Analytics**
  - Built-in Web Vitals tracking
  - Package: @vercel/analytics (v1.6.1)
  - Tracks: Core Web Vitals, page performance

- **Recommendations**:
  - **Google Analytics 4**: User behavior, conversion tracking
  - **Mixpanel**: Product analytics, user cohorts
  - **Plausible**: Privacy-focused analytics
  - **Heap**: Automatic event tracking

### Performance Monitoring
- **Next.js Built-in**: Speed Insights
- **Lighthouse**: Built into Chrome DevTools
- **PageSpeed Insights**: Google's tool

---

## TECHNOLOGY SELECTION RATIONALE

### Why Next.js?
- ✅ Full-stack JavaScript (single language)
- ✅ Built-in API routes (no separate backend)
- ✅ Automatic code splitting (better performance)
- ✅ SSR/SSG capabilities (better SEO)
- ✅ Vercel native support (optimized hosting)
- ✅ Large ecosystem and community

### Why PostgreSQL?
- ✅ ACID compliance (data integrity)
- ✅ JSON support (flexible schema)
- ✅ Scalable (powers major platforms)
- ✅ Free and open-source
- ✅ PostGIS extension for geospatial queries

### Why Tailwind CSS?
- ✅ Fast development
- ✅ Responsive utilities (mobile-first)
- ✅ Small production bundle (~15KB)
- ✅ Consistent design system
- ✅ Works great with shadcn/ui

### Why Razorpay?
- ✅ Popular in Indian market
- ✅ Multiple payment methods
- ✅ Good documentation
- ✅ Test mode available
- ✅ Competitive pricing

### Why Zustand for State?
- ✅ Lightweight (3KB vs Redux 40KB)
- ✅ Simple API (no boilerplate)
- ✅ Excellent TypeScript support
- ✅ Perfect for cart management

---

## PRODUCTION SCALABILITY ASSESSMENT

### Current Architecture Readiness: **7/10**

#### ✅ Strengths
1. **Serverless Backend**: Auto-scales with Vercel
2. **PostgreSQL**: Enterprise-grade database
3. **JWT Auth**: Stateless, scales horizontally
4. **CDN**: Vercel provides global edge network
5. **Connection Pooling**: pg pool prevents connection exhaustion

#### ⚠️ Areas for Improvement
1. **Rate Limiting**: Not yet implemented
   - Add: `@vercel/rate-limit` or custom middleware
   
2. **Caching**: Currently only SWR client-side
   - Add: Redis for sessions, frequently accessed data
   - Recommendation: Upstash Redis (serverless)

3. **File Storage**: Currently local (not scalable)
   - Migrate to: AWS S3, Cloudinary, or Vercel Blob
   - Impact: Can't handle millions of images locally

4. **Email Queue**: Synchronous email sending
   - Add: Message queue (Bull, RabbitMQ) or Vercel KV
   - Impact: Prevent timeouts on high volume

5. **Database Optimization**
   - Add: Indexes on frequently queried columns
   - Add: Query monitoring (pg_stat_statements)
   - Monitor: Connection pool usage

6. **API Rate Limiting**: No global rate limits
   - Add: Middleware to limit requests per IP/user
   - Prevents abuse and DDoS

7. **Logging & Monitoring**
   - Add: Sentry for error tracking
   - Add: Datadog/New Relic for performance
   - Current: Only console.log

8. **Search Optimization**
   - Current: LIKE queries (inefficient at scale)
   - Add: Full-text search (PostgreSQL FTS)
   - Or: Elasticsearch for better search

### Estimated Capacity
- **Current**: ~1,000 concurrent users
- **With optimization**: ~100,000 concurrent users
- **With caching + CDN**: ~1,000,000+ concurrent users

### Cost Estimation (Monthly)
| Component | Small (~10K Users) | Medium (~100K Users) | Large (~1M+ Users) |
|-----------|-------------------|----------------------|-------------------|
| Vercel    | $20               | $100-200             | $500+             |
| Database  | $10-20            | $50-100              | $200+             |
| Email     | $0-5              | $10-20               | $50+              |
| CDN/Cache | $5                | $50-100              | $500+             |
| **Total** | **$35-50**        | **$210-420**         | **$1,250+**       |

---

## SECURITY CHECKLIST

- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Passwords hashed with bcrypt
- ✅ SQL parameterized queries (no injection)
- ✅ Razorpay signature verification
- ✅ Role-based access control
- ⚠️ HTTPS enforced (Vercel default)
- ⚠️ Rate limiting (recommended)
- ⚠️ Input validation (implement globally)
- ⚠️ CORS configuration (implement if needed)
- ⚠️ Secrets management (use Vercel KV)

---

## FUTURE TECH STACK ENHANCEMENTS

### Essential (Q2-Q3)
1. **Redis Cache** (Upstash)
   - Session storage
   - Cart data caching
   - Frequently accessed product data

2. **Search Engine** (Meilisearch / Elasticsearch)
   - Full-text product search
   - Autocomplete
   - Filters and facets

3. **File Storage** (Vercel Blob / AWS S3)
   - Unlimited image storage
   - CDN distribution
   - Image optimization

### Important (Q3-Q4)
1. **Analytics** (Sentry / PostHog)
   - Error tracking
   - Performance monitoring
   - User behavior

2. **Background Jobs** (Bull / Vercel Cron)
   - Email queue
   - Order processing
   - Notifications

3. **Real-time Updates** (WebSockets / Server-Sent Events)
   - Live order tracking
   - Push notifications
   - Inventory updates

### Nice-to-Have (Post-Launch)
1. **Recommendation Engine** (Machine Learning)
   - Personalized product suggestions
   - Collaborative filtering

2. **Advanced Maps** (Google Maps API / Mapbox)
   - Store locator
   - Delivery tracking
   - Route optimization

3. **Mobile Apps** (React Native / Flutter)
   - iOS and Android apps
   - Push notifications
   - Offline support

---

## CONCLUSION

GharMart's technology stack is **well-suited for a production e-commerce platform** with excellent foundations for scalability. The use of Next.js, PostgreSQL, and Vercel provides a modern, maintainable architecture that can handle growth from 1,000 to 100,000+ users with proper optimization and monitoring.

**Key Recommendations**:
1. Implement Redis caching layer
2. Migrate to cloud file storage (S3/Blob)
3. Add comprehensive error tracking (Sentry)
4. Implement rate limiting
5. Set up performance monitoring

With these enhancements, the platform can reliably serve millions of users while maintaining sub-second response times and 99.9%+ uptime.
