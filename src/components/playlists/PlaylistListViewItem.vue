<script setup>
defineProps({
    playlist: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <router-link :to="{name: 'playlist-details', params: {id: playlist.id}}">
        <div class="single">
            <div class="thumbnail">
                <img
                    :src="playlist.coverUrl"
                    alt="Thumbnail"
                />
            </div>
            <div class="info">
                <h3>{{ playlist.title }}</h3>
                <p>Created by {{ playlist.userName }}</p>
            </div>
            <div class="song-number">
                <p>{{ playlist.songs.length }} songs</p>
            </div>
        </div>
    </router-link>
</template>

<style lang="scss" scoped>
  $border-radius: 10px;
  $transition-duration: 0.2s;
  $shadow-color: rgba(50, 50, 50, 0.05);

  .single {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: $border-radius;
    background: white;
    margin: 16px 0;
    transition: all ease $transition-duration;

    &:hover {
      box-shadow: 1px 2px 3px $shadow-color;
      transform: scale(1.02);
      transition: all ease $transition-duration;
    }

    .thumbnail {
      max-width: 100px;
      max-height: 100px;
      overflow: hidden;
      border-radius: $border-radius;

      img {
        max-width: 150%;
        max-height: 150%;
        display: block;
      }
    }

    .info {
      margin: 0 30px;
    }

    .song-number {
      margin-left: auto;
    }
  }
</style>
