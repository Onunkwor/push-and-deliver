// Vendors Service - Read and Update (verify & block)
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
import type { Vendor } from '@/types';

const COLLECTION_NAME = 'Restaurants';

export const vendorsService = {
  // Read all vendors
  async getAllVendors(): Promise<Vendor[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Vendor[];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  // Read active vendors
  async getActiveVendors(): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Vendor[];
    } catch (error) {
      console.error('Error fetching active vendors:', error);
      throw error;
    }
  },

  // Read pending verification vendors
  async getPendingVendors(): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('verified', '==', false),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Vendor[];
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      throw error;
    }
  },

  // Read blocked vendors
  async getBlockedVendors(): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'blocked'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Vendor[];
    } catch (error) {
      console.error('Error fetching blocked vendors:', error);
      throw error;
    }
  },

  // Read a single vendor by ID
  async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
        } as Vendor;
      }

      return null;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  },

  // Verify a vendor
  async verifyVendor(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        verified: true,
        status: 'active',
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error verifying vendor:', error);
      throw error;
    }
  },

  // Block a vendor
  async blockVendor(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'blocked',
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error blocking vendor:', error);
      throw error;
    }
  },

  // Unblock a vendor
  async unblockVendor(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'active',
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error unblocking vendor:', error);
      throw error;
    }
  },

  // Update vendor information
  async updateVendor(id: string, vendorData: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...vendorData,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },
};
