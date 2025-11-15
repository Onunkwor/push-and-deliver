// Referrals Service - Read only
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Referral } from '@/types';

const COLLECTION_NAME = 'referrals';

export const referralsService = {
  // Read all referrals
  async getAllReferrals(): Promise<Referral[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Referral[];
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },

  // Read referrals by referrer ID
  async getReferralsByReferrerId(referrerId: string): Promise<Referral[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('referrerId', '==', referrerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Referral[];
    } catch (error) {
      console.error('Error fetching referrals by referrer:', error);
      throw error;
    }
  },

  // Read referrals by referred ID
  async getReferralsByReferredId(referredId: string): Promise<Referral[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('referredId', '==', referredId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Referral[];
    } catch (error) {
      console.error('Error fetching referrals by referred:', error);
      throw error;
    }
  },

  // Read referrals by status
  async getReferralsByStatus(status: 'pending' | 'completed' | 'expired'): Promise<Referral[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Referral[];
    } catch (error) {
      console.error('Error fetching referrals by status:', error);
      throw error;
    }
  },

  // Read a single referral by ID
  async getReferralById(id: string): Promise<Referral | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          completedAt: docSnap.data().completedAt?.toDate(),
        } as Referral;
      }

      return null;
    } catch (error) {
      console.error('Error fetching referral:', error);
      throw error;
    }
  },

  // Get total referral count
  async getTotalReferralCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching referral count:', error);
      throw error;
    }
  },
};
