# Product Reviews System Implementation

## Overview

Complete product review system allowing customers to rate, review, and vote on product reviews. Includes moderation status tracking, helpful vote counts, and verified purchase indicators.

## Database Schema

### Tables Created

#### `product_reviews`
Core reviews table with all review metadata:
- `id` (UUID): Primary key
- `product_id` (UUID): Reference to product
- `customer_id` (UUID): Reference to customer (user)
- `order_id` (UUID): Reference to order (verified purchase)
- `rating` (1-5): Star rating
- `title` (VARCHAR 255): Optional review title
- `comment` (TEXT): Review content
- `verified_purchase` (BOOLEAN): Automatically set if customer purchased product
- `photo_urls` (TEXT[]): Array of image URLs for review
- `helpful_count` (INTEGER): Number of helpful votes
- `unhelpful_count` (INTEGER): Number of unhelpful votes
- `moderation_status` ('pending'|'approved'|'rejected'): Review approval status
- `created_at` / `updated_at`: Timestamps

Constraints:
- UNIQUE(product_id, customer_id): One review per product per customer
- CHECK: rating between 1-5

#### `review_votes`
Tracks helpful/unhelpful votes on reviews:
- `id` (UUID): Primary key
- `review_id` (UUID): Reference to review
- `customer_id` (UUID): Reference to voter
- `vote_type` ('helpful'|'unhelpful'): Vote type
- `created_at`: Timestamp

Constraints:
- UNIQUE(review_id, customer_id): One vote per customer per review
- CASCADE delete when review deleted

### Indexes
- `idx_reviews_product_id`: Fast product review lookups
- `idx_reviews_customer_id`: Fast customer review queries
- `idx_reviews_moderation_status`: Fast approved review filtering
- `idx_reviews_created_at`: Efficient sorting by date
- `idx_review_votes_review_id`: Fast vote lookups

## API Endpoints

### GET `/api/products/[id]/reviews`
Fetch paginated reviews for a product.

**Parameters:**
- `limit` (int, default 10): Reviews per page
- `offset` (int, default 0): Pagination offset
- `sortBy` (string): 'recent' | 'helpful' | 'rating-high' | 'rating-low'
- `rating` (int, optional): Filter by specific rating (1-5)

**Returns:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "customer_id": "uuid",
      "rating": 5,
      "title": "Great product!",
      "comment": "Very satisfied...",
      "verified_purchase": true,
      "helpful_count": 12,
      "unhelpful_count": 1,
      "created_at": "2026-05-24T10:30:00Z",
      "customer_name": "John Doe"
    }
  ],
  "total": 45,
  "averageRating": "4.5",
  "ratingDistribution": { "5": 20, "4": 15, "3": 7, "2": 2, "1": 1 },
  "limit": 10,
  "offset": 0
}
```

**Authentication:** None required

### GET `/api/customer/reviews`
Fetch customer's own reviews with pagination.

**Parameters:**
- `limit` (int, default 10): Reviews per page
- `offset` (int, default 0): Pagination offset

**Returns:** Same structure as product reviews endpoint

**Authentication:** JWT required (customer only)

### POST `/api/customer/reviews`
Submit a new review for a product.

**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Optional title",
  "comment": "Review content (max 500 chars)",
  "photoUrls": []
}
```

**Validation:**
- Rating: Required, 1-5
- Comment: Required, max 500 characters
- One review per product per customer
- Verified purchase auto-detected from order history

**Returns:**
```json
{
  "review": {
    "id": "uuid",
    "product_id": "uuid",
    "rating": 5,
    "title": "Optional title",
    "comment": "Review content",
    "verified_purchase": true,
    "created_at": "2026-05-24T10:30:00Z"
  }
}
```

**Authentication:** JWT required

**Status Codes:**
- 201: Review created
- 400: Invalid data
- 409: Review already exists for this product
- 404: Product not found

### POST `/api/reviews/[id]/vote`
Vote on helpful/unhelpful for a review. Supports toggling and switching votes.

**Request Body:**
```json
{
  "voteType": "helpful" | "unhelpful"
}
```

**Behavior:**
- First vote: Records vote
- Same vote again: Removes vote
- Different vote: Switches vote type

**Returns:**
```json
{
  "helpful_count": 13,
  "unhelpful_count": 1
}
```

**Authentication:** JWT required

### DELETE `/api/customer/reviews/[id]`
Delete own review.

**Authentication:** JWT required

**Returns:**
```json
{
  "success": true
}
```

## React Components

### ReviewForm
Located: `components/reviews/ReviewForm.tsx`

Component for customers to submit new reviews:
- 5-star rating selector with hover effect
- Optional title input (255 char limit)
- Required comment field (500 char limit)
- Real-time character count
- Form validation with error messages
- Success confirmation message
- Disables multiple submissions

**Props:**
- `productId` (string, required): Product UUID
- `onSuccess` (function, optional): Callback when review submitted

**Usage:**
```tsx
<ReviewForm productId={product.id} onSuccess={() => refetchReviews()} />
```

### ReviewList
Located: `components/reviews/ReviewList.tsx`

Display paginated, filterable list of product reviews:
- Sort by: Recent, Helpful, Highest Rating, Lowest Rating
- Filter by rating (1-5 stars)
- Display rating, verified purchase badge, customer name, date
- Helpful/unhelpful vote buttons with counts
- Pagination controls
- Loading state skeleton

**Props:**
- `productId` (string, required): Product UUID

**Features:**
- Auto-fetches reviews based on sort/filter
- Handles vote toggling and switching
- Shows vote counts in real-time
- Displays verified purchase badge

### RatingDistribution
Located: `components/reviews/RatingDistribution.tsx`

Visual display of review statistics:
- Average rating (large number + stars)
- Total review count
- Rating distribution bars (1-5 stars)
- Percentage breakdown
- Color-coded bars

**Props:**
- `averageRating` (string): Average rating (e.g. "4.5")
- `distribution` (object): Count for each rating (1-5)
- `totalReviews` (number): Total review count

### ProductReviewsSection
Located: `components/reviews/ProductReviewsSection.tsx`

Complete reviews section for product pages:
- Combines RatingDistribution + ReviewList + ReviewForm
- 3-column layout on desktop, 1 column on mobile
- "Write a Review" button to toggle form
- Lazy loads review data

**Props:**
- `productId` (string, required): Product UUID

**Usage:**
```tsx
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';

// In product page
<ProductReviewsSection productId={product.id} />
```

## Pages

### `/customer/reviews`
Customer review management dashboard:
- List all customer's reviews
- Show product image, name, rating
- Display moderation status (Pending, Approved, Rejected)
- Edit review (button placeholder, future feature)
- Delete review with confirmation
- Show helpful/unhelpful counts
- Paginated view (10 reviews per page)
- Back navigation to dashboard

**Features:**
- Only shows customer's own reviews
- JWT authentication required
- Respects moderation status
- Helpful/unhelpful social proof visible

## Security Features

1. **Authentication**
   - JWT token verification on all POST/DELETE endpoints
   - Customer ID extracted from JWT payload
   - Token stored in HTTP-only cookie

2. **Data Validation**
   - Rating: 1-5 check
   - Comment: 500 character limit
   - Email/name sanitization
   - Photo URL validation (future)

3. **Data Isolation**
   - Customers can only see approved reviews publicly
   - Customers can only manage their own reviews
   - One review per product per customer (database constraint)
   - One vote per customer per review (database constraint)

4. **SQL Safety**
   - Parameterized queries throughout
   - No string interpolation
   - Cascade delete for data consistency

5. **Rate Limiting**
   - One review per product per customer
   - Recommended: Add rate limiting middleware for votes (future)

## Moderation

Review moderation status tracking:
- **pending**: New reviews need admin approval
- **approved**: Visible to all customers
- **rejected**: Customer can see but hidden from public

**Implementation:**
- Public endpoints only show 'approved' reviews
- Customer can view all own reviews regardless of status
- Admin panel needed for approval (future)

## Verified Purchase Indicator

Automatically detects purchased products:
- Checks order history for customer
- Looks for orders with status: paid, shipped, delivered
- Sets `verified_purchase = true` if found
- Displays "Verified Purchase" badge on review

## Installation & Setup

### 1. Run Migration
```bash
psql -U postgres -d gharmart -f scripts/08-product-reviews-migration.sql
```

### 2. Integration with Product Page

Add to product detail page:
```tsx
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';

export default function ProductPage({ params }: { params: { slug: string } }) {
  // ... existing product loading code

  return (
    <main>
      {/* Product details */}
      <ProductDetails product={product} />

      {/* Reviews section */}
      <section className="mt-16">
        <ProductReviewsSection productId={product.id} />
      </section>
    </main>
  );
}
```

### 3. Add Review Link to Customer Dashboard
```tsx
<Link href="/customer/reviews">My Reviews ({reviewCount})</Link>
```

## Future Enhancements

1. **Photo Reviews**: Allow customers to upload photos with reviews
2. **Edit Reviews**: Allow customers to edit own reviews
3. **Review Replies**: Sellers can reply to reviews
4. **Helpful Analytics**: Track which reviews are most helpful
5. **Review Flagging**: Report inappropriate reviews
6. **Moderation Dashboard**: Admin panel for approving/rejecting reviews
7. **Review Notifications**: Notify when review gets helpful votes
8. **Review Summary**: AI-generated summary of review sentiment

## Testing Checklist

- [ ] Create review with valid rating and comment
- [ ] Prevent duplicate reviews for same product
- [ ] Display "Verified Purchase" badge only for buyers
- [ ] Sort reviews by helpful count
- [ ] Filter reviews by rating
- [ ] Vote helpful/unhelpful on review
- [ ] Toggle vote (vote again to remove)
- [ ] Switch vote type (helpful → unhelpful)
- [ ] View own reviews in dashboard
- [ ] Delete own review
- [ ] See updated helpful count in real-time
- [ ] Show average rating and distribution
- [ ] Paginate through reviews
