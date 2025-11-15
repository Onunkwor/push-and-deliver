// Analytics Service - Dashboard metrics and statistics
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VerificationStatus, WithdrawalStatus } from '@/types';

export const analyticsService = {
  // Get total counts for all entities
  async getTotalCounts(): Promise<{
    totalUsers: number;
    totalRiders: number;
    totalRestaurants: number;
    totalFees: number;
    totalReferrals: number;
    totalWithdrawals: number;
  }> {
    try {
      const [users, riders, restaurants, fees, referrals, withdrawals] = await Promise.all([
        getDocs(collection(db, 'Users')),
        getDocs(collection(db, 'Riders')),
        getDocs(collection(db, 'Restaurants')),
        getDocs(collection(db, 'Fees')),
        getDocs(collection(db, 'Referrals')),
        getDocs(collection(db, 'Withdrawals')),
      ]);

      return {
        totalUsers: users.size,
        totalRiders: riders.size,
        totalRestaurants: restaurants.size,
        totalFees: fees.size,
        totalReferrals: referrals.size,
        totalWithdrawals: withdrawals.size,
      };
    } catch (error) {
      console.error('Error fetching total counts:', error);
      throw error;
    }
  },

  // Get verified counts
  async getVerifiedCounts(): Promise<{
    verifiedRiders: number;
    verifiedRestaurants: number;
  }> {
    try {
      const [riders, restaurants] = await Promise.all([
        getDocs(query(collection(db, 'Riders'), where('verificationStatus', '==', VerificationStatus.verified))),
        getDocs(query(collection(db, 'Restaurants'), where('verificationStatus', '==', VerificationStatus.verified))),
      ]);

      return {
        verifiedRiders: riders.size,
        verifiedRestaurants: restaurants.size,
      };
    } catch (error) {
      console.error('Error fetching verified counts:', error);
      throw error;
    }
  },

  // Get pending verification counts
  async getPendingCounts(): Promise<{
    pendingRiders: number;
    pendingRestaurants: number;
  }> {
    try {
      const [riders, restaurants] = await Promise.all([
        getDocs(query(collection(db, 'Riders'), where('verificationStatus', '==', VerificationStatus.unverified))),
        getDocs(query(collection(db, 'Restaurants'), where('verificationStatus', '==', VerificationStatus.unverified))),
      ]);

      return {
        pendingRiders: riders.size,
        pendingRestaurants: restaurants.size,
      };
    } catch (error) {
      console.error('Error fetching pending counts:', error);
      throw error;
    }
  },

  // Get blocked counts
  async getBlockedCounts(): Promise<{
    blockedRiders: number;
    blockedRestaurants: number;
  }> {
    try {
      const [riders, restaurants] = await Promise.all([
        getDocs(query(collection(db, 'Riders'), where('verificationStatus', '==', VerificationStatus.blocked))),
        getDocs(query(collection(db, 'Restaurants'), where('verificationStatus', '==', VerificationStatus.blocked))),
      ]);

      return {
        blockedRiders: riders.size,
        blockedRestaurants: restaurants.size,
      };
    } catch (error) {
      console.error('Error fetching blocked counts:', error);
      throw error;
    }
  },

  // Get referral statistics
  async getReferralStats(): Promise<{
    totalReferrals: number;
  }> {
    try {
      const all = await getDocs(collection(db, 'Referrals'));

      return {
        totalReferrals: all.size,
      };
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      throw error;
    }
  },

  // Get withdrawal statistics
  async getWithdrawalStats(): Promise<{
    totalWithdrawals: number;
    successfulWithdrawals: number;
    pendingWithdrawals: number;
    failedWithdrawals: number;
    reversedWithdrawals: number;
  }> {
    try {
      const [all, successful, pending, failed, reversed] = await Promise.all([
        getDocs(collection(db, 'Withdrawals')),
        getDocs(query(collection(db, 'Withdrawals'), where('status', '==', WithdrawalStatus.Successful))),
        getDocs(query(collection(db, 'Withdrawals'), where('status', '==', WithdrawalStatus.Pending))),
        getDocs(query(collection(db, 'Withdrawals'), where('status', '==', WithdrawalStatus.Failed))),
        getDocs(query(collection(db, 'Withdrawals'), where('status', '==', WithdrawalStatus.Reversed))),
      ]);

      return {
        totalWithdrawals: all.size,
        successfulWithdrawals: successful.size,
        pendingWithdrawals: pending.size,
        failedWithdrawals: failed.size,
        reversedWithdrawals: reversed.size,
      };
    } catch (error) {
      console.error('Error fetching withdrawal stats:', error);
      throw error;
    }
  },

  // Get new registrations in last N days
  async getNewRegistrations(days: number = 7): Promise<{
    newUsers: number;
    newRiders: number;
    newRestaurants: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      const [users, riders, restaurants] = await Promise.all([
        getDocs(query(collection(db, 'Users'), where('createdAt', '>=', cutoffTimestamp))),
        getDocs(query(collection(db, 'Riders'), where('createdAt', '>=', cutoffTimestamp))),
        getDocs(query(collection(db, 'Restaurants'), where('createdAt', '>=', cutoffTimestamp))),
      ]);

      return {
        newUsers: users.size,
        newRiders: riders.size,
        newRestaurants: restaurants.size,
      };
    } catch (error) {
      console.error('Error fetching new registrations:', error);
      throw error;
    }
  },

  // Get online riders count
  async getOnlineRidersCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'Riders'), where('onlineStatus', '==', true))
      );
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching online riders count:', error);
      throw error;
    }
  },

  // Get open restaurants count
  async getOpenRestaurantsCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'Restaurants'), where('isOpen', '==', true))
      );
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching open restaurants count:', error);
      throw error;
    }
  },
};
