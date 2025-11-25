// src/types/index.ts - Updated to match Firebase schema
import { Timestamp, GeoPoint } from "firebase/firestore";

// Type definitions (replacing enums for erasableSyntaxOnly compatibility)
export const VehicleType = {
  car: "car",
  bicycle: "bicycle",
  bike: "bike",
} as const;
export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const VerificationStatus = {
  unverified: "unverified",
  verified: "verified",
  blocked: "blocked",
  deleted: "deleted",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const WithdrawalStatus = {
  Successful: "Successful",
  Pending: "Pending",
  Failed: "Failed",
  Reversed: "Reversed",
} as const;
export type WithdrawalStatus =
  (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export const TransactionStatus = {
  Successful: "Successful",
  Pending: "Pending",
  Failed: "Failed",
} as const;
export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionType = {
  Credit: "Credit",
  Debit: "Debit",
} as const;
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const FeeType = {
  fooddeliveryfee: 0,
  servicefee: 1,
  ridehauling: 2,
  freightbooking: 3,
} as const;
export type FeeType = (typeof FeeType)[keyof typeof FeeType];

// Interfaces
export interface Rider {
  id?: string;
  fullname?: string;
  phonenumber?: string;
  fcmtoken?: string;
  deviceName?: string;
  email?: string;
  imageUrl?: string;
  homeAddress?: string;
  vehicleType?: VehicleType;
  verificationStatus?: VerificationStatus;
  ongoingOrder?: boolean;
  vehicleMakename?: string;
  vehicleModelName?: string;
  vehicleColor?: string;
  plateNumber?: string;
  currentridelocationupdatedoc?: string;
  onlineStatus?: boolean;
  location?: {
    geohash?: string;
    geopoint?: GeoPoint;
  };
  bankInfo?: {
    bankName?: string;
    acctName?: string;
    acctNumber?: string;
  };
  transactionPin?: string;
  walletbalance?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface User {
  id?: string;
  username?: string;
  email?: string;
  phonenumber?: string;
  fcmtoken?: string;
  location?: {
    geohash?: string;
    geopoint?: GeoPoint;
  };
  imageURL?: string;
  referralID?: string;
  deviceName?: string;
  walletbalance?: number;
  referredBy?: string;
  referralsCount?: number;
  rewardpoints?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Restaurant {
  id?: string;
  legalname?: string;
  fcmtoken?: string;
  rating?: number;
  restaurantImage?: string;
  verificationStatus?: VerificationStatus;
  email?: string;
  phonenumber?: string;
  categories?: string[];
  isOpen?: boolean;
  openingHrs?: {
    monday?: { open?: string; close?: string };
    tuesday?: { open?: string; close?: string };
    wednesday?: { open?: string; close?: string };
    thursday?: { open?: string; close?: string };
    friday?: { open?: string; close?: string };
    saturday?: { open?: string; close?: string };
    sunday?: { open?: string; close?: string };
  };
  physicalAddress?: string;
  location?: {
    geohash?: string;
    geopoint?: GeoPoint;
  };
  walletbalance?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Withdrawal {
  id?: string;
  amount?: number;
  bankname?: string;
  accountnumber?: number;
  accountname?: string;
  status?: WithdrawalStatus;
  userID?: string;
  userType?: string;
  transactionID?: string;
  createdAt?: Timestamp | Date;
}

export interface Transaction {
  id?: string;
  amount?: number;
  narration?: string;
  status?: TransactionStatus;
  trxref?: string;
  time?: Timestamp | Date;
  transactionType?: TransactionType;
  userID?: string;
}

export interface Referral {
  id?: string;
  createdAt?: Timestamp | Date;
  referralCodeUsed?: string;
  referredUid?: string;
  referrerUid?: string;
}

export interface Fee {
  id: string;
  feeType?: FeeType;
  name?: string;
  bookingFee?: number;
  perKm?: number;
  perMin?: number;
  perWeight?: number;
  minFare?: number;
  surgeMultiplier?: number;
  addedSurge?: number;
  value?: number;
}
// Legacy types (kept for compatibility, will be removed)
export interface Vendor extends Restaurant {}
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "promotion" | "alert";
  targetAudience: "all" | "users" | "riders" | "vendors";
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Coupon {
  id?: string;
  createdAt?: Timestamp | Date;
  isActive: boolean;
  percentageDiscount: number;
}

export interface TicketMessage {
  id?: string;
  createdAt?: Timestamp | Date;
  message?: string;
  senderId?: string;
  timestamp?: Timestamp | Date;
  type?: "text" | "image";
  imageurl?: string;
}

export interface SupportTicket {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastMessage?: string;
  lastSender?: string;
  status?: "open" | "closed" | "pending";
  userId?: string;
  messages?: TicketMessage[];
}

export interface RestaurantOrderCustomer {
  email?: string;
  id?: string;
  imageUrl?: string;
  name?: string;
  phoneNumber?: string;
}

export interface RestaurantOrderLocation {
  deliveryAddress?: string;
  geohash?: string;
  geopoint?: GeoPoint;
}

export interface RestaurantOrderMenuItem {
  name?: string;
  price?: number;
  quantity?: number;
  title?: string;
}

export interface RestaurantOrderRestaurant {
  address?: string;
  id?: string;
  imageURL?: string;
  name?: string;
  phoneNumber?: string;
}

export interface RestaurantOrderStatusTimeline {
  status?: number;
  timestamp?: Timestamp | Date;
}

export interface RestaurantOrder {
  id?: string;
  createdAt?: Timestamp | Date;
  customer?: RestaurantOrderCustomer;
  declinelist?: any[];
  deliveryFee?: number;
  deliveryLocation?: RestaurantOrderLocation;
  ispaid?: boolean;
  menuItems?: RestaurantOrderMenuItem[];
  noteForRestaurant?: string;
  noteForRider?: string;
  orderStatus?: number;
  otp?: number;
  paymentType?: number; // 0 = wallet, 1 = cash
  restaurant?: RestaurantOrderRestaurant;
  restaurantLocation?: {
    geohash?: string;
    geopint?: GeoPoint;
  };
  riderID?: string;
  riderPhoneNumber?: string;
  servicefee?: number;
  statusTimeline?: RestaurantOrderStatusTimeline[];
  totalAmount?: number;
}
