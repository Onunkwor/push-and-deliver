import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DHLExportRate, DHLExportRatesDocument } from "@/types";

const COLLECTION_NAME = "DHL";
const DOCUMENT_ID = "ExportRates";

export const exportRatesService = {
  async getExportRates(): Promise<DHLExportRate[]> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as DHLExportRatesDocument;
        // Sort by weight just in case
        return (data.list || []).sort((a, b) => a.weight - b.weight);
      } else {
        console.log("No such document!");
        return [];
      }
    } catch (error) {
      console.error("Error getting export rates:", error);
      throw error;
    }
  },

  async updateExportRates(rates: DHLExportRate[]): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
      // Check if document exists first, if not create it
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, { list: rates });
      } else {
        await updateDoc(docRef, {
          list: rates,
        });
      }
    } catch (error) {
      console.error("Error updating export rates:", error);
      throw error;
    }
  },
};
