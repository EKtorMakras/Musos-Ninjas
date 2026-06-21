<script setup>
import { ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { useDocument } from "@/composables/useDocument";
import { useNotifications } from "@/composables/useNotifications";
import { withAsync } from "@/api/helpers/withAsync";

const props = defineProps({
    playlist: {
        type: Object,
        required: true,
    },
});

const { error, updateDoc, loading } = useDocument("playlists", props.playlist.id);
const { showSuccess, showError } = useNotifications();

const formData = ref({
    title: "",
    artist: "",
});

const showForm = ref(false);

async function handleSubmit() {
    const newSong = {
        title: formData.value.title,
        artist: formData.value.artist,
        id: Math.floor(Math.random() * 1000000).toString(), // Temporary ID generation
    };

    // Update the playlist with the new song
    const updatedSongs = [...(props.playlist.songs || []), newSong];
    await withAsync(updateDoc, { songs: updatedSongs });

    if (error.value.updateDoc) {
        showError(error.value.updateDoc);
        return;
    }

    showSuccess("Song added successfully!");

    // Reset form and hide it
    formData.value = {
        title: "",
        artist: "",
    };

    showForm.value = false;
}
</script>

<template>
    <div class="add-song">
        <BaseButton
            v-if="!showForm"
            color="primary"
            @click="showForm = true"
        >
            Add Song
        </BaseButton>

        <form
            v-if="showForm"
            @submit.prevent="handleSubmit"
        >
            <h4>Add new song to {{ playlist.title }}</h4>
            <input
                v-model="formData.title"
                type="text"
                required
                placeholder="Song title"
            />
            <input
                v-model="formData.artist"
                type="text"
                required
                placeholder="Artist"
            />
            <div class="button-container">
                <BaseButton
                    type="submit"
                    color="primary"
                    :loading="loading.updateDoc"
                    :disabled="loading.updateDoc"
                >
                    Add Song
                </BaseButton>
                <BaseButton
                    color="secondary"
                    @click="showForm = false"
                >
                    Cancel
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
.add-song {
    text-align: center;
    margin-top: 40px;

    .button-container {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    form {
        max-width: 100%;
        text-align: left;
    }
}

</style>
