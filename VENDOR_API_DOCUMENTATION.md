# GharMart Vendor API Documentation

**Base URL**: `/api/vendor`  
**Authentication**: Bearer Token (JWT)  
**Version**: 1.0  
**Last Updated**: 2026-05-25

---

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Examples](#examples)

---

## Authentication

All vendor API endpoints require JWT authentication via Bearer token.

### Getting a Token

**Register:**
```bash
POST /api/vendor/auth/register
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "SecurePass123",
  "phone": "+919876543210",
  "shop_name": "My Shop",
  "city": "Mumbai",
  "state": "Maharashtra"
}

Response:
{
  "error": false,
  "message": "Vendor registered successfully",
  "data": {
    "vendor_id": "uuid",
    "email": "vendor@example.com",
    "phone": "+919876543210"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Login:**
```bash
POST /api/vendor/auth/login
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "SecurePass123"
}

Response:
{
  "error": false,
  "message": "Login successful",
  "data": {
    "vendor_id": "uuid",
    "email": "vendor@example.com",
    "shop_id": "uuid",
    "shop_status": "pending"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Using the Token

All requests must include the Bearer token:
```
Authorization: Bearer <accessToken>
```

---

## API Endpoints

### 1. PROFILE MANAGEMENT

#### Get Profile
```
GET /api/vendor/profile
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "vendor": {
      "id": "uuid",
      "email": "vendor@example.com",
      "phone": "+919876543210",
      "created_at": "2026-05-25T10:00:00Z"
    },
    "shop": {
      "id": "uuid",
      "name": "My Shop",
      "description": "...",
      "logo_url": "...",
      "city": "Mumbai",
      "state": "Maharashtra",
      "phone": "+919876543210",
      "rating": 4.5,
      "status": "pending"
    },
    "kyc": {
      "status": "pending",
      "total_documents": 0,
      "verified_documents": 0
    },
    "stats": {
      "total_products": 10,
      "total_orders": 25,
      "total_revenue": 50000,
      "avg_rating": 4.5
    }
  }
}
```

#### Update Profile
```
PUT /api/vendor/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "shop_name": "Updated Shop Name",
  "description": "New description",
  "city": "Mumbai",
  "state": "Maharashtra",
  "address": "123 Main St",
  "pincode": "400001",
  "phone": "+919876543210",
  "email": "vendor@example.com",
  "logo_url": "https://...",
  "banner_url": "https://..."
}

Response:
{
  "error": false,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

---

### 2. PRODUCT MANAGEMENT

#### List Products
```
GET /api/vendor/products?page=1&limit=20&status=all
Authorization: Bearer <token>

Status filter: all | approved | pending | rejected

Response:
{
  "error": false,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "description": "...",
        "price": 1000,
        "original_price": 1200,
        "image_url": "...",
        "category": "Electronics",
        "stock": 50,
        "rating": 4.5,
        "reviews_count": 10,
        "status": "approved",
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### Create Product
```
POST /api/vendor/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 1000,
  "original_price": 1200,
  "image_url": "https://...",
  "category": "Electronics",
  "stock": 50
}

Response (201):
{
  "error": false,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "price": 1000,
    "category": "Electronics",
    "stock": 50,
    "status": "pending",
    "message": "Product created successfully. Awaiting moderation approval."
  }
}
```

#### Get Product
```
GET /api/vendor/products/[id]
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "...",
    "price": 1000,
    "original_price": 1200,
    "image_url": "...",
    "category": "Electronics",
    "stock": 50,
    "rating": 4.5,
    "reviews_count": 10,
    "status": "approved",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### Update Product
```
PUT /api/vendor/products/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 900,
  "stock": 40,
  "image_url": "..."
}

Response:
{
  "error": false,
  "data": {
    "message": "Product updated successfully"
  }
}
```

#### Delete Product
```
DELETE /api/vendor/products/[id]
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

### 3. ORDER MANAGEMENT

#### List Orders
```
GET /api/vendor/orders?page=1&limit=20&status=all
Authorization: Bearer <token>

Status filter: all | pending | confirmed | paid | shipped | delivered | cancelled

Response:
{
  "error": false,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Product Name",
        "customer_email": "customer@example.com",
        "customer_phone": "+919876543210",
        "amount": 1000,
        "status": "shipped",
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### Get Order
```
GET /api/vendor/orders/[id]
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Product Name",
    "product_price": 1000,
    "customer": {
      "email": "customer@example.com",
      "phone": "+919876543210"
    },
    "total_amount": 1000,
    "status": "shipped",
    "shipping_address": "...",
    "payment_method": "card",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### Update Order Status
```
PUT /api/vendor/orders/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped"
}

Valid statuses: pending, confirmed, paid, shipped, delivered, cancelled

Response:
{
  "error": false,
  "data": {
    "message": "Order status updated to shipped"
  }
}
```

---

### 4. PAYOUTS & FINANCIAL

#### List Payouts
```
GET /api/vendor/payouts?page=1&limit=20&status=all
Authorization: Bearer <token>

Status filter: all | pending | requested | approved | processing | completed | failed

Response:
{
  "error": false,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "amount": 10000,
        "commission_amount": 500,
        "net_amount": 9500,
        "period": {
          "start": "2026-04-01",
          "end": "2026-04-30"
        },
        "status": "completed",
        "method": "bank_transfer",
        "transaction_id": "TXN123456",
        "requested_at": "2026-05-01T10:00:00Z",
        "completed_at": "2026-05-05T10:00:00Z",
        "created_at": "2026-05-01T10:00:00Z"
      }
    ]
  }
}
```

#### Request Payout
```
POST /api/vendor/payouts/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "method": "bank_transfer",
  "bank_account_id": "uuid"
}

Valid methods: bank_transfer, upi, wallet

Response (201):
{
  "error": false,
  "data": {
    "payout_id": "uuid",
    "amount": 10000,
    "commission_amount": 500,
    "net_amount": 9500,
    "status": "requested",
    "message": "Payout request submitted. It will be processed within 2-3 business days."
  }
}
```

#### Get Bank Accounts
```
GET /api/vendor/bank-accounts
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "account_holder_name": "Vendor Name",
        "account_number": "****5678",
        "ifsc_code": "SBIN0001234",
        "bank_name": "State Bank of India",
        "account_type": "savings",
        "is_verified": true,
        "is_default": true,
        "created_at": "..."
      }
    ]
  }
}
```

#### Add Bank Account
```
POST /api/vendor/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "account_holder_name": "Vendor Name",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "account_type": "savings",
  "is_default": false
}

Response (201):
{
  "error": false,
  "data": {
    "id": "uuid",
    "account_number": "****7890",
    "bank_name": "State Bank of India",
    "account_type": "savings",
    "is_default": false,
    "message": "Bank account added. Please verify to use for payouts."
  }
}
```

---

### 5. NOTIFICATIONS

#### Get Notifications
```
GET /api/vendor/notifications?page=1&limit=20&unread_only=false
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Order Received",
        "message": "You have a new order",
        "type": "order_new",
        "is_read": false,
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### Mark Notifications as Read
```
POST /api/vendor/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "notification_ids": ["uuid1", "uuid2"]
}

OR to mark all as read:
{
  "mark_all": true
}

Response:
{
  "error": false,
  "data": {
    "message": "Notifications marked as read"
  }
}
```

---

### 6. ANALYTICS

#### Get Analytics
```
GET /api/vendor/analytics?period=30d&metric=all
Authorization: Bearer <token>

Period: 7d | 30d | 90d | all

Response:
{
  "error": false,
  "data": {
    "period": "30d",
    "summary": {
      "total_products": 50,
      "total_orders": 200,
      "total_customers": 150,
      "total_revenue": 500000,
      "avg_rating": 4.5,
      "pending_orders": 10
    },
    "daily": [
      {
        "date": "2026-05-25",
        "orders": 10,
        "revenue": 15000,
        "new_customers": 5
      }
    ],
    "top_products": [
      {
        "id": "uuid",
        "name": "Top Product",
        "order_count": 50,
        "revenue": 50000,
        "rating": 4.8
      }
    ],
    "revenue_by_category": [
      {
        "category": "Electronics",
        "order_count": 100,
        "revenue": 300000,
        "customers": 80
      }
    ],
    "customer_metrics": {
      "returning_customers": 100,
      "new_last_week": 20
    }
  }
}
```

---

### 7. KYC MANAGEMENT

#### Get KYC Status
```
GET /api/vendor/kyc
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": {
    "overall_status": "pending",
    "documents": [
      {
        "id": "uuid",
        "type": "aadhar",
        "number": "1234-5678-9012",
        "status": "verified",
        "verified_at": "2026-05-20T10:00:00Z"
      }
    ],
    "summary": {
      "total_documents": 4,
      "verified_documents": 2,
      "pending_documents": 2
    },
    "required_documents": ["aadhar", "pan", "gst", "bank_account"]
  }
}
```

#### Upload KYC Document
```
POST /api/vendor/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_type": "aadhar",
  "document_url": "https://...",
  "document_number": "1234-5678-9012",
  "expiry_date": "2030-12-31"
}

Valid types: aadhar, pan, gst, bank_account, shop_license, address_proof

Response (201):
{
  "error": false,
  "data": {
    "document_id": "uuid",
    "type": "aadhar",
    "status": "submitted",
    "message": "Document uploaded successfully. Verification is in progress."
  }
}
```

---

### 8. SUPPORT TICKETS

#### List Tickets
```
GET /api/vendor/support/tickets?page=1&limit=20&status=all
Authorization: Bearer <token>

Status filter: all | open | in_progress | waiting_customer | resolved | closed

Response:
{
  "error": false,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "subject": "Payment issue",
        "category": "billing",
        "status": "open",
        "priority": "high",
        "created_at": "2026-05-25T10:00:00Z",
        "updated_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

#### Create Ticket
```
POST /api/vendor/support/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Payment issue",
  "description": "I haven't received payment for last month",
  "category": "billing",
  "priority": "high"
}

Valid categories: billing, technical, product, order, payout, account, other
Valid priorities: low, medium, high, urgent

Response (201):
{
  "error": false,
  "data": {
    "id": "uuid",
    "subject": "Payment issue",
    "category": "billing",
    "status": "open",
    "priority": "high",
    "created_at": "2026-05-25T10:00:00Z",
    "message": "Ticket created. You will receive updates via email."
  }
}
```

---

### 9. PROMOTIONS/COUPONS

#### List Promotions
```
GET /api/vendor/promotions?page=1&limit=20&status=all
Authorization: Bearer <token>

Status filter: all | draft | active | paused | expired | cancelled

Response:
{
  "error": false,
  "data": {
    "promotions": [
      {
        "id": "uuid",
        "code": "SUMMER20",
        "description": "20% off on summer collection",
        "type": "discount_percentage",
        "discount_value": 20,
        "max_uses": 100,
        "current_uses": 45,
        "min_order_value": 1000,
        "valid_from": "2026-06-01T00:00:00Z",
        "valid_until": "2026-08-31T23:59:59Z",
        "status": "active",
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

#### Create Promotion
```
POST /api/vendor/promotions
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SUMMER20",
  "description": "20% off on summer collection",
  "type": "discount_percentage",
  "discount_value": 20,
  "max_uses": 100,
  "min_order_value": 1000,
  "valid_from": "2026-06-01T00:00:00Z",
  "valid_until": "2026-08-31T23:59:59Z"
}

Valid types: discount_percentage, discount_fixed, buy_one_get_one, free_shipping, category_discount

Response (201):
{
  "error": false,
  "data": {
    "id": "uuid",
    "code": "SUMMER20",
    "type": "discount_percentage",
    "discount_value": 20,
    "status": "draft",
    "message": "Promotion created in draft mode. Activate when ready to use."
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": true,
  "message": "Error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (no ownership) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |

### Common Errors

**401 Unauthorized**
```json
{
  "error": true,
  "message": "Unauthorized",
  "details": "Valid vendor token required"
}
```

**403 Forbidden**
```json
{
  "error": true,
  "message": "You do not own this product"
}
```

**400 Bad Request**
```json
{
  "error": true,
  "message": "Missing required fields",
  "details": {
    "required": ["name", "price", "category"]
  }
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:
- **Standard Rate**: 100 requests per minute per vendor
- **Burst**: 10 requests per second

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1621954800
```

---

## Examples

### Complete Flow: Register → Add Product → Create Order

**1. Register Vendor**
```bash
curl -X POST http://localhost:3000/api/vendor/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePass123",
    "phone": "+919876543210",
    "shop_name": "My Cool Shop",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:3000/api/vendor/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePass123"
  }'
# Save the accessToken from response
```

**3. Create Product**
```bash
curl -X POST http://localhost:3000/api/vendor/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 50000,
    "original_price": 60000,
    "category": "Electronics",
    "stock": 10,
    "image_url": "https://..."
  }'
```

**4. Get Orders**
```bash
curl -X GET http://localhost:3000/api/vendor/orders?page=1&limit=20 \
  -H "Authorization: Bearer <accessToken>"
```

**5. Request Payout**
```bash
curl -X POST http://localhost:3000/api/vendor/payouts/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "amount": 10000,
    "method": "bank_transfer",
    "bank_account_id": "<account_id>"
  }'
```

---

## Support

For issues or questions, create a support ticket via:
```
POST /api/vendor/support/tickets
```

Or contact support@gharmart.com
