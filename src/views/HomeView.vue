<script setup>
import { onMounted } from "vue";
import LayoutDefault from "@/layouts/LayoutDefault.vue";
import { useCollection } from "@/composables/useCollection";
import PlaylistListView from "@/components/playlists/PlaylistListView.vue";

const { error: getCollectionError, getCollection, documents } = useCollection("playlists");

onMounted(async () => {
    await getCollection();
});

</script>

<template>
    <LayoutDefault>
        <h1>Home page</h1>
        <div v-if="documents?.length > 0">
            <PlaylistListView :playlists="documents" />
        </div>

        <div
            v-if="getCollectionError.getCollection"
            class="error"
        >
            {{ getCollectionError.getCollection }}
        </div>
    </LayoutDefault>
</template>
