import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DHLZone } from "@/types";

const COLLECTION_NAME = "DHL";
const DOCUMENT_ID = "Zones";

export const dhlZonesService = {
  // Get all zones
  async getZones(): Promise<DHLZone[]> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // The zones are stored in a "list" field
        return (data.list || []) as DHLZone[];
      }

      return [];
    } catch (error) {
      console.error("Error fetching DHL zones:", error);
      throw error;
    }
  },

  // Update a single zone's zone number
  async updateZone(index: number, newZoneValue: number): Promise<void> {
    try {
      // First, get the current zones
      const zones = await this.getZones();

      if (index < 0 || index >= zones.length) {
        throw new Error("Invalid zone index");
      }

      // Update the zone value at the specified index
      zones[index] = { ...zones[index], zone: newZoneValue };

      // Save back to Firestore
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      await updateDoc(docRef, { list: zones });
    } catch (error) {
      console.error("Error updating DHL zone:", error);
      throw error;
    }
  },

  // Update all zones at once
  async updateAllZones(zones: DHLZone[]): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      await updateDoc(docRef, { list: zones });
    } catch (error) {
      console.error("Error updating DHL zones:", error);
      throw error;
    }
  },
};
