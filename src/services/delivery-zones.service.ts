import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { State, LGA } from "@/types";

const STATES_COLLECTION = "States";
const LGAS_COLLECTION = "LGAs";

export const deliveryZonesService = {
  async getAllStates(): Promise<State[]> {
    try {
      const querySnapshot = await getDocs(collection(db, STATES_COLLECTION));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }));
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  },

  async getLGAsForState(stateId: string): Promise<LGA[]> {
    try {
      const lgaCollectionRef = collection(
        db,
        STATES_COLLECTION,
        stateId,
        LGAS_COLLECTION
      );
      const querySnapshot = await getDocs(lgaCollectionRef);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
        deliveryfee: doc.data().deliveryfee || 0,
      }));
    } catch (error) {
      console.error(`Error fetching LGAs for state ${stateId}:`, error);
      throw error;
    }
  },

  async updateLGAFee(
    stateId: string,
    lgaId: string,
    fee: number
  ): Promise<void> {
    try {
      const lgaDocRef = doc(
        db,
        STATES_COLLECTION,
        stateId,
        LGAS_COLLECTION,
        lgaId
      );
      await updateDoc(lgaDocRef, {
        deliveryfee: fee,
      });
    } catch (error) {
      console.error(`Error updating fee for LGA ${lgaId}:`, error);
      throw error;
    }
  },
};
