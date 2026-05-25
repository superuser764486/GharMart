/**
 * Vendor-specific types and interfaces
 */

// Vendor status enum
export enum VendorStatus {
  PENDING = 'pending', // Awaiting KYC approval
  APPROVED = 'approved', // Approved by admin
  ACTIVE = 'active', // Can sell products
  SUSPENDED = 'suspended', // Temporarily blocked
  BANNED = 'banned', // Permanently blocked
}

// Shop status
export enum ShopStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// KYC document types
export enum KYCDocumentType {
  AADHAR = 'aadhar',
  PAN = 'pan',
  GST = 'gst',
  BANK_ACCOUNT = 'bank_account',
  SHOP_LICENSE = 'shop_license',
  ADDRESS_PROOF = 'address_proof',
}

// KYC status
export enum KYCStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Payout status
export enum PayoutStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Payout method
export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  WALLET = 'wallet',
}

// Product moderation status
export enum ProductModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Order status (vendor perspective)
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

// Notification type
export enum NotificationType {
  ORDER_NEW = 'order_new',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_RETURNED = 'order_returned',
  REVIEW_POSTED = 'review_posted',
  PAYOUT_PROCESSED = 'payout_processed',
  STOCK_LOW = 'stock_low',
  SYSTEM_ALERT = 'system_alert',
  KYC_REJECTED = 'kyc_rejected',
  KYC_APPROVED = 'kyc_approved',
}

// Support ticket status
export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// Promotion type
export enum PromotionType {
  DISCOUNT_PERCENTAGE = 'discount_percentage',
  DISCOUNT_FIXED = 'discount_fixed',
  BUY_ONE_GET_ONE = 'buy_one_get_one',
  FREE_SHIPPING = 'free_shipping',
  CATEGORY_DISCOUNT = 'category_discount',
}

// Promotion status
export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// ===== VENDOR DATA TYPES =====

export interface VendorProfile {
  vendor_id: string;
  email: string;
  phone: string;
  status: VendorStatus;
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  opening_time: string; // "09:00"
  closing_time: string; // "22:00"
  phone: string;
  email: string;
  rating: number;
  status: ShopStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  vendor_id: string;
  document_type: KYCDocumentType;
  document_url: string;
  document_number?: string;
  expiry_date?: string;
  status: KYCStatus;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  vendor_id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_type: 'savings' | 'current';
  is_verified: boolean;
  verified_at?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UPIAccount {
  id: string;
  vendor_id: string;
  upi_id: string;
  account_holder_name: string;
  is_verified: boolean;
  verified_at?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  vendor_id: string;
  amount: number;
  commission_amount: number;
  net_amount: number;
  period_start: string;
  period_end: string;
  status: PayoutStatus;
  method: PayoutMethod;
  requested_at?: string;
  approved_at?: string;
  completed_at?: string;
  transaction_id?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  vendor_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  vendor_id: string;
  subject: string;
  description: string;
  category: string;
  status: SupportTicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionCoupon {
  id: string;
  vendor_id: string;
  code: string;
  description: string;
  type: PromotionType;
  discount_value: number;
  max_uses: number;
  current_uses: number;
  min_order_value: number;
  valid_from: string;
  valid_until: string;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
}

export interface VendorStats {
  total_products: number;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  avg_rating: number;
  active_promotions: number;
  pending_payouts: number;
  pending_orders: number;
}

export interface VendorAnalytics {
  date: string;
  orders: number;
  revenue: number;
  customers_new: number;
  average_order_value: number;
  conversion_rate: number;
}
