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
import { withAsync } from "@/api/helpers/withAsync";

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

        const { response, error: err } = await withAsync(addFirestoreDoc, collectionRef, doc);

        if (err) {
            console.error("Error adding document:", err);
            error.value.addDoc = err.message || "Could not add document";
            loading.value.addDoc = false;
            throw err;
        }

        loading.value.addDoc = false;
        return response;
    };

    const updateDoc = async (docId, updates) => {
        loading.value.updateDoc = true;
        error.value.updateDoc = null;

        const docRef = doc(projectFirestore, collectionName, docId);
        const { error: err } = await withAsync(updateFirestoreDoc, docRef, updates);

        if (err) {
            console.error("Error updating document:", err);
            error.value.updateDoc = err.message || "Could not update document";
            loading.value.updateDoc = false;
            throw err;
        }

        loading.value.updateDoc = false;
    };

    const deleteDoc = async (docId) => {
        loading.value.deleteDoc = true;
        error.value.deleteDoc = null;

        const docRef = doc(projectFirestore, collectionName, docId);
        const { error: err } = await withAsync(deleteFirestoreDoc, docRef);

        if (err) {
            console.error("Error deleting document:", err);
            error.value.deleteDoc = err.message || "Could not delete document";
            loading.value.deleteDoc = false;
            throw err;
        }

        loading.value.deleteDoc = false;
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
