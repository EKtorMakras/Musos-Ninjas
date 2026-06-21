<script setup>
import { ref } from "vue";
import { useStorage } from "@/composables/useStorage";
import { useCollection } from "@/composables/useCollection";
import { useAuthStore } from "@/stores/useAuth";
import { timestamp } from "@/firebase";
import { useRouter } from "vue-router";
import LayoutDefault from "@/layouts/LayoutDefault.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseFileUpload from "@/components/base/BaseFileUpload.vue";
import { useNotifications } from "@/composables/useNotifications";

// ========= COMPOSABLES & STORES ========== //
const { error: fileUploadError, url: imageUrl, filePath, uploadImage } = useStorage();
const { error: docError, addDoc } = useCollection("playlists");
const authStore = useAuthStore();
const { showSuccess, showError } = useNotifications();
const router = useRouter();

// ========= REFS ========== //
const title = ref("");
const description = ref("");
const file = ref(null);
const fileError = ref(null);
const isPending = ref(false);
const pond = ref(null);


// ========= METHODS ========== //
const handleSubmit = async () => {
    if(!file.value) {
        fileError.value = "Please upload a cover image for the playlist.";
        return;
    }

    isPending.value = true;

    await uploadImage(file.value);

    if (fileUploadError.value) {
        showError(fileUploadError.value);
        return;
    }

    const response = await addDoc({
        title: title.value,
        description: description.value,
        coverUrl: imageUrl.value,
        filePath: filePath.value,
        userId: authStore.user.uid,
        userName: authStore.user.displayName,
        songs: [],
        createdAt: timestamp(),
    });

    isPending.value = false;

    if (docError.value.addDoc) {
        showError(docError.value.addDoc);
        return;
    }

    showSuccess(`Playlist "${title.value}" created successfully!`);
    router.push({ name: "playlist-details", params: { id: response.id } });
    resetForm();
};

const handleFilePondAdd = (error, fileItem) => {
    if (error) {
        fileError.value = "Something went wrong. Please try again.";
        return;
    }
    if (fileItem) {
        file.value = fileItem.file;
        fileError.value = null;
    }
};

const handleFilePondRemove = () => {
    file.value = null;
};

const resetForm = () => {
    title.value = "";
    description.value = "";
    file.value = null;
    fileError.value = null;
    pond.value?.removeFiles();
};
</script>

<template>
    <LayoutDefault>
        <form @submit.prevent="handleSubmit">
            <h4>Create a New Playlist</h4>
            <input
                v-model="title"
                type="text"
                required
                placeholder="Playlist title"
            />

            <textarea
                v-model="description"
                required
                placeholder="Playlist description..."
            ></textarea>

            <!-- upload playlist image -->
            <label>Upload Playlist Cover Image</label>
            <BaseFileUpload
                ref="pond"
                name="cover"
                label-idle="Drag & drop your image or <span class='filepond--label-action'>Browse</span>"
                @addfile="handleFilePondAdd"
                @removefile="handleFilePondRemove"
            />
            <div
                v-if="fileError"
                class="error"
            >
                {{ fileError }}
            </div>

            <BaseButton
                type="submit"
                :loading="isPending"
                :disabled="isPending"
            >
                Create
            </BaseButton>
        </form>
    </LayoutDefault>
</template>


<style scoped>
  label {
    font-size: 12px;
    display: block;
    margin-top: 30px;
    margin-bottom: 10px;
  }
  button {
    margin-top: 20px;
  }
</style>
