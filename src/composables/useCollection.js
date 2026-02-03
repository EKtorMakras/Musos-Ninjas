import { ref, onUnmounted } from "vue";
import {
    collection,
    addDoc as addFirestoreDoc,
    updateDoc as updateFirestoreDoc,
    deleteDoc as deleteFirestoreDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    where,
    limit,
} from "firebase/firestore";
import { projectFirestore } from "@/firebase";

export function useCollection(collectionName) {
    const error = ref({
        addDoc: null,
        updateDoc: null,
        deleteDoc: null,
        getCollection: null,
    });
    const loading = ref({
        addDoc: false,
        updateDoc: false,
        deleteDoc: false,
        getCollection: false,
    });
    const documents = ref(null);

    let unsubscribe = null;
    let collectionRef = collection(projectFirestore, collectionName);

    const addDoc = async (doc) => {
        loading.value.addDoc = true;
        error.value.addDoc = null;

        try {
            const docRef = await addFirestoreDoc(collectionRef, doc);
            return docRef;
        } catch (err) {
            console.error("Error adding document:", err);
            error.value.addDoc = err.message || "Could not add document";
            throw err;
        } finally {
            loading.value.addDoc = false;
        }
    };

    const updateDoc = async (docId, updates) => {
        loading.value.updateDoc = true;
        error.value.updateDoc = null;

        try {
            const docRef = doc(projectFirestore, collectionName, docId);
            await updateFirestoreDoc(docRef, updates);
        } catch (err) {
            console.error("Error updating document:", err);
            error.value.updateDoc = err.message || "Could not update document";
            throw err;
        } finally {
            loading.value.updateDoc = false;
        }
    };

    const deleteDoc = async (docId) => {
        loading.value.deleteDoc = true;
        error.value.deleteDoc = null;

        try {
            const docRef = doc(projectFirestore, collectionName, docId);
            await deleteFirestoreDoc(docRef);
        } catch (err) {
            console.error("Error deleting document:", err);
            error.value.deleteDoc = err.message || "Could not delete document";
            throw err;
        } finally {
            loading.value.deleteDoc = false;
        }
    };

    const getCollection = (options = {}) => {
        loading.value.getCollection = true;
        error.value.getCollection = null;

        // Build query constraints
        const queryConstraints = [];

        // Add where clauses if provided
        if (options.where) {
            options.where.forEach(([field, operator, value]) => {
                queryConstraints.push(where(field, operator, value));
            });
        }

        // Add orderBy if provided
        if (options.orderBy) {
            const [field, direction = "asc"] = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
            queryConstraints.push(orderBy(field, direction));
        }

        // Add limit if provided
        if (options.limit) {
            queryConstraints.push(limit(options.limit));
        }

        const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;

        // Set up real-time listener
        unsubscribe = onSnapshot(
            q,
            (snap) => {
                let results = [];

                snap.docs.forEach((doc) => {
                    results.push({ ...doc.data(), id: doc.id });
                });

                documents.value = results;
                loading.value.getCollection = false;
            },
            (err) => {
                console.error("Error fetching collection:", err);
                error.value.getCollection = err.message || "Could not fetch the collection";
                loading.value.getCollection = false;
            }
        );
    };

    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    return { error, loading, addDoc, updateDoc, deleteDoc, documents, getCollection };
}
