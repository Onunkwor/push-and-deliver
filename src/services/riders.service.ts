// Riders Service - Read and Update (verify & block)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Rider } from '@/types';
import { VerificationStatus } from '@/types';

const COLLECTION_NAME = 'Riders';

export const ridersService = {
  // Read all riders
  async getAllRiders(): Promise<Rider[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
      })) as Rider[];
    } catch (error) {
      console.error('Error fetching riders:', error);
      throw error;
    }
  },

  // Read verified riders
  async getVerifiedRiders(): Promise<Rider[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('verificationStatus', '==', VerificationStatus.verified),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
      })) as Rider[];
    } catch (error) {
      console.error('Error fetching verified riders:', error);
      throw error;
    }
  },

  // Read unverified/pending riders
  async getPendingRiders(): Promise<Rider[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('verificationStatus', '==', VerificationStatus.unverified),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
      })) as Rider[];
    } catch (error) {
      console.error('Error fetching pending riders:', error);
      throw error;
    }
  },

  // Read blocked riders
  async getBlockedRiders(): Promise<Rider[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('verificationStatus', '==', VerificationStatus.blocked),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
      })) as Rider[];
    } catch (error) {
      console.error('Error fetching blocked riders:', error);
      throw error;
    }
  },

  // Read a single rider by ID
  async getRiderById(id: string): Promise<Rider | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.(),
          updatedAt: docSnap.data().updatedAt?.toDate?.(),
        } as Rider;
      }

      return null;
    } catch (error) {
      console.error('Error fetching rider:', error);
      throw error;
    }
  },

  // Verify a rider
  async verifyRider(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        verificationStatus: VerificationStatus.verified,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error verifying rider:', error);
      throw error;
    }
  },

  // Block a rider
  async blockRider(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        verificationStatus: VerificationStatus.blocked,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error blocking rider:', error);
      throw error;
    }
  },

  // Unblock a rider
  async unblockRider(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        verificationStatus: VerificationStatus.verified,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error unblocking rider:', error);
      throw error;
    }
  },

  // Update rider information
  async updateRider(id: string, riderData: Partial<Omit<Rider, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...riderData,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating rider:', error);
      throw error;
    }
  },
};
