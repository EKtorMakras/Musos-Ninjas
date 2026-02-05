<script>
const SIZE_MAP = {
    sm: {
        padding: "6px 16px",
        fontSize: "13px",
        height: "34px",
        minWidth: "80px"
    },
    md: {
        padding: "10px 20px",
        fontSize: "14px",
        height: "40px",
        minWidth: "100px"
    },
    lg: {
        padding: "14px 28px",
        fontSize: "16px",
        height: "48px",
        minWidth: "130px"
    }
};
</script>

<script setup>
import { computed, useAttrs } from "vue";
import { RouterLink } from "vue-router";
import BaseLoader from "./BaseLoader.vue";

const props = defineProps({
    color: {
        type: String,
        default: "secondary",
        validator: (value) => ["primary", "secondary", "warning"].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    to: {
        type: [String, Object],
        default: null
    },
    href: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: "button"
    },
    target: {
        type: String,
        default: null
    },
    rel: {
        type: String,
        default: null
    },
    size: {
        type: String,
        default: "md",
        validator: (value) => Object.prototype.hasOwnProperty.call(SIZE_MAP, value)
    }
});

const attrs = useAttrs();

const loaderColor = computed(() => {
    if (props.color === "secondary") {
        return "var(--foreground-dark)";
    }
    return "var(--foreground-light)";
});

const isRouterLink = computed(() => Boolean(props.to));
const isExternalLink = computed(() => Boolean(props.href) && !props.to);
const isInteractionDisabled = computed(() => props.disabled || props.loading);

const componentTag = computed(() => {
    if (isRouterLink.value) {
        return RouterLink;
    }
    if (isExternalLink.value) {
        return "a";
    }
    return "button";
});

const componentAttrs = computed(() => {
    if (isRouterLink.value) {
        return {
            to: props.to,
            tabindex: isInteractionDisabled.value ? -1 : undefined,
            "aria-disabled": isInteractionDisabled.value ? "true" : undefined
        };
    }

    if (isExternalLink.value) {
        const relValue = props.rel || (props.target === "_blank" ? "noopener noreferrer" : null);
        return {
            href: props.href,
            target: props.target,
            rel: relValue,
            role: "button",
            tabindex: isInteractionDisabled.value ? -1 : undefined,
            "aria-disabled": isInteractionDisabled.value ? "true" : undefined
        };
    }

    return {
        type: props.type,
        disabled: isInteractionDisabled.value
    };
});

const mergedAttrs = computed(() => ({
    ...attrs,
    ...componentAttrs.value
}));

const computedStyles = computed(() => SIZE_MAP[props.size] ?? SIZE_MAP.md);
</script>
<template>
    <component
        :is="componentTag"
        class="base-button"
        :class="[`base-button--${color}`, { 'base-button--loading': loading }]"
        v-bind="mergedAttrs"
    >
        <span
            v-if="loading"
            class="base-button__loader"
        >
            <BaseLoader
                size="16px"
                :color="loaderColor"
            />
        </span>
        <span
            v-else
            class="base-button__content"
        >
            <slot></slot>
        </span>
    </component>
</template>

<style lang="scss" scoped>
.base-button {
  background: var(--secondary);
  color: var(--foreground-dark);
  border-radius: 8px;
  border: 0;
  padding: v-bind("computedStyles.padding");
  font-weight: 600;
  font-size: v-bind("computedStyles.fontSize");
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: v-bind("computedStyles.minWidth");
  height: v-bind("computedStyles.height");
  transition: all 0.2s ease-in-out;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  *,
    :deep(*) {
      color: inherit;
    }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    pointer-events: none;
  }

  &--primary {
    background: var(--primary);
    color: var(--foreground-light);

    &:hover:not(:disabled) {
      background: var(--primary-dark);
    }
  }

  &--secondary {
    background: var(--secondary);
    color: var(--foreground-dark);

    &:hover:not(:disabled) {
      background: var(--primary);
      color: var(--foreground-light);
    }

  }

  &--warning {
    background: var(--warning);
    color: var(--foreground-light);

    &:hover:not(:disabled) {
      background: var(--warning-dark);
    }
  }

  &--loading {
    cursor: wait;
  }
}

.base-button__loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-button__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
