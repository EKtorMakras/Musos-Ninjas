<script setup>
import { ref } from "vue";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
);

defineProps({
    acceptedFileTypes: {
        type: Array,
        default: () => ["image/jpeg", "image/png", "image/gif", "image/webp"],
    },
    allowMultiple: {
        type: Boolean,
        default: false,
    },
    labelIdle: {
        type: String,
        default: "Drag & drop your file or <span class='filepond--label-action'>Browse</span>",
    },
    name: {
        type: String,
        default: "file",
    },
});

const emit = defineEmits(["addfile", "removefile"]);

const pond = ref(null);

const onAddFile = (error, fileItem) => {
    emit("addfile", error, fileItem);
};

const onRemoveFile = () => {
    emit("removefile");
};

defineExpose({
    removeFiles: () => pond.value?.removeFiles(),
});
</script>

<template>
    <FilePond
        ref="pond"
        :name="name"
        :label-idle="labelIdle"
        :accepted-file-types="acceptedFileTypes"
        :allow-multiple="allowMultiple"
        credits="false"
        @addfile="onAddFile"
        @removefile="onRemoveFile"
    />
</template>

<style>
  /* FilePond theme overrides */
  .filepond--panel-root {
    border-radius: 8px;
    background-color: var(--foreground-light);
    border: 1px dashed var(--secondary);
  }
  .filepond--drop-label {
    color: var(--primary);
    font-family: "Nunito", sans-serif;
    font-size: 14px;
  }
  .filepond--label-action {
    text-decoration: underline;
    color: var(--primary-dark);
    font-weight: 700;
  }
  .filepond--drop-label label {
    font-size: 14px;
    margin: 0;
  }
  .filepond--item-panel {
    background-color: var(--primary);
  }
  .filepond--drip-blob {
    background-color: var(--primary);
  }
  .filepond--browser {
    border: 0;
    margin: 0;
    padding: 0;
  }
</style>
