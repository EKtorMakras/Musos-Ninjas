<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useDocument } from "@/composables/useDocument";
import { useStorage } from "@/composables/useStorage";
import { useAuthStore } from "@/stores/useAuth";
import { useNotifications } from "@/composables/useNotifications";
import { withAsync } from "@/api/helpers/withAsync";
import LayoutDefault from "@/layouts/LayoutDefault.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseConfirmDeleteDialog from "@/components/base/BaseConfirmDeleteDialog.vue";
import AddSong from "@/components/song/AddSong.vue";
import SingleSong from "@/components/song/SingleSong.vue";

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const router = useRouter();
const { error, loading, document: playlist, updateDoc, deleteDoc } = useDocument("playlists", props.id);
const { showSuccess, showError } = useNotifications();
const { error: storageError, deleteImage } = useStorage();

const authStore = useAuthStore();

const ownership = computed(() => {
    return playlist.value && authStore.user && playlist.value.userId === authStore.user.uid;
});

const showDeleteDialog = ref(false);
const showSongDeleteDialog = ref(false);
const songToDeleteId = ref(null);

async function handleDelete() {
    await withAsync(deleteImage, playlist.value.filePath);

    if (storageError.value) {
        showError(storageError.value);
        showDeleteDialog.value = false;
        return;
    }

    await withAsync(deleteDoc);

    if (error.value.deleteDoc) {
        showError(error.value.deleteDoc);
        showDeleteDialog.value = false;
        return;
    }

    showSuccess("Playlist deleted successfully!");
    router.push({ name: "home" });
}

async function handleDeleteSong(songId) {
    const updatedSongs = playlist.value.songs.filter((song) => song.id !== songId);
    await withAsync(updateDoc, { songs: updatedSongs });

    if (error.value.updateDoc) {
        showError(error.value.updateDoc || "Could not delete song");
        showSongDeleteDialog.value = false;
        songToDeleteId.value = null;
        return;
    }

    showSuccess("Song deleted successfully!");
    showSongDeleteDialog.value = false;
    songToDeleteId.value = null;
}

function promptDeleteSong(songId) {
    songToDeleteId.value = songId;
    showSongDeleteDialog.value = true;
}

function cancelDeleteSong() {
    showSongDeleteDialog.value = false;
    songToDeleteId.value = null;
}

async function confirmDeleteSong() {
    if (!songToDeleteId.value) {
        return;
    }

    await handleDeleteSong(songToDeleteId.value);
}
</script>

<template>
    <LayoutDefault>
        <div
            v-if="playlist"
            class="playlist-details"
        >
            <!-- Playlist Info -->
            <div class="playlist-details__info">
                <img
                    :src="playlist.coverUrl"
                    alt="Playlist Cover"
                    class="playlist-details__cover"
                />
                <div class="playlist-details__meta">
                    <h2 class="playlist-details__title">
                        {{ playlist.title }}
                    </h2>
                    <p class="playlist-details__creator">
                        Created by {{ playlist.userName }}
                    </p>
                    <p class="playlist-details__description">
                        {{ playlist.description }}
                    </p>
                    <BaseButton
                        v-if="ownership"
                        color="warning"
                        @click="showDeleteDialog = true"
                    >
                        Delete Playlist
                    </BaseButton>
                </div>
            </div>

            <!-- Song list -->
            <div class="playlist-details__song-list">
                <div v-if="!playlist.songs || playlist.songs.length === 0">
                    No songs added yet. Click the button below to add a song.
                </div>
                <template v-else>
                    <SingleSong
                        v-for="song in playlist.songs"
                        :key="song.id"
                        :song="song"
                        :ownership="ownership"
                        @delete-song="promptDeleteSong"
                    />
                </template>
                <AddSong
                    v-if="ownership"
                    :playlist="playlist"
                />
            </div>
        </div>

        <BaseConfirmDeleteDialog
            v-if="showDeleteDialog"
            title="Delete Playlist"
            message="Are you sure you want to delete this playlist? This action cannot be undone."
            :loading="loading.deleteDoc"
            @confirm="handleDelete"
            @cancel="showDeleteDialog = false"
        />

        <BaseConfirmDeleteDialog
            v-if="showSongDeleteDialog"
            title="Delete Song"
            message="Are you sure you want to delete this song? This action cannot be undone."
            :loading="loading.updateDoc"
            @confirm="confirmDeleteSong"
            @cancel="cancelDeleteSong"
        />

        <!-- Error Messages -->
        <div
            v-if="error.getDocument"
            class="error"
        >
            {{ error.getDocument }}
        </div>
        <div
            v-if="error.deleteDoc"
            class="error"
        >
            {{ error.deleteDoc }}
        </div>
        <div
            v-if="error.updateDoc"
            class="error"
        >
            {{ error.updateDoc }}
        </div>
    </LayoutDefault>
</template>

<style lang="scss" scoped>
.playlist-details {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 80px;

    &__info {
        text-align: center;
    }

    &__cover {
        overflow: hidden;
        border-radius: 20px;
        width: 100%;
        object-fit: cover;
    }

    &__title {
        text-transform: capitalize;
        font-size: 28px;
        margin-top: 20px;
    }

    &__creator {
        color: #999;
        margin-bottom: 20px;
    }

    &__description {
        text-align: left;
        margin-bottom: 20px;
    }
}

</style>
