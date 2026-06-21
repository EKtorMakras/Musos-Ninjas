<script setup>
import PlaylistListViewItem from "@/components/playlists/PlaylistListViewItem.vue";

defineProps({
    playlists: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="list-view">
        <PlaylistListViewItem
            v-for="playlist in playlists"
            :key="playlist.id"
            :playlist="playlist"
        />
    </div>
</template>
