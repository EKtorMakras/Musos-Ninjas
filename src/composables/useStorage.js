import { projectStorage } from "@/firebase";
import { useAuthStore } from "@/stores/useAuth";
import { ref } from "vue";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const useStorage = () => {
    const authStore = useAuthStore();
    const user = authStore.user;

    const error = ref(null);
    const url = ref(null);
    const loading = ref(false);
    const filePath = ref(null);

    const uploadImage = async (file) => {
        filePath.value = `covers/${user.uid}/${file.name}`;
        const fileRef = storageRef(projectStorage, filePath.value);

        loading.value = true;
        error.value = null;

        try {
            const response = await uploadBytes(fileRef, file);
            url.value = await getDownloadURL(response.ref);
        } catch (err) {
            console.error("Error uploading file:", err);
            error.value = err.message || "Could not upload file";
        } finally {
            loading.value = false;
        }
    };

    // Delete Image
    const deleteImage = async (path) => {
        const fileRef = storageRef(projectStorage, path);

        error.value = null;

        try {
            await deleteObject(fileRef);
        } catch (err) {
            console.error("Error deleting file:", err);
            error.value = err.message || "Could not delete file";
            throw err;
        }
    };

    return { error, url, loading, filePath, uploadImage, deleteImage };
};
