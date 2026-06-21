import { watchEffect, ref } from "vue";
import { doc, onSnapshot, updateDoc as updateFirestoreDoc, deleteDoc as deleteFirestoreDoc } from "firebase/firestore";
import { projectFirestore } from "@/firebase";
import { withAsync } from "@/api/helpers/withAsync";

export function useDocument(collectionName, id) {
    const document = ref(null);

    const error = ref({
        getDocument: null,
        updateDoc: null,
        deleteDoc: null,
    });

    const loading = ref({
        updateDoc: false,
        deleteDoc: false,
    });

    const documentRef = doc(projectFirestore, collectionName, id);

    const unsub = onSnapshot(
        documentRef,
        (doc) => {
            if (loading.value.deleteDoc) return;

            if (doc.data()) {
                document.value = { ...doc.data(), id: doc.id };
                error.value.getDocument = null;
            } else {
                error.value.getDocument = "That document does not exist";
            }
        },
        (err) => {
            console.error(err.message);
            error.value.getDocument = "Problem fetching the document";
        }
    );

    const updateDoc = async (updates) => {
        loading.value.updateDoc = true;
        error.value.updateDoc = null;

        const { error: err } = await withAsync(updateFirestoreDoc, documentRef, updates);

        if (err) {
            console.error("Error updating document:", err);
            error.value.updateDoc = err.message || "Could not update document";
            loading.value.updateDoc = false;
            throw err;
        }

        loading.value.updateDoc = false;
    };

    const deleteDoc = async () => {
        loading.value.deleteDoc = true;
        error.value.deleteDoc = null;

        const { error: err } = await withAsync(deleteFirestoreDoc, documentRef);

        if (err) {
            console.error("Error deleting document:", err);
            error.value.deleteDoc = err.message || "Could not delete document";
            loading.value.deleteDoc = false;
            throw err;
        }

        loading.value.deleteDoc = false;
    };

    watchEffect((onInvalidate) => {
        onInvalidate(() => unsub());
    });

    return { error, loading, document, updateDoc, deleteDoc };
}
