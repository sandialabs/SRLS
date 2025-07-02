<template>
  <span>
    <v-tooltip v-if="tooltip" location="top" :openDelay="delay">
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          :disabled="disabled"
          style="margin: 0; padding: 0;"
          @click="$emit('icon-clicked')"
        >
          <v-icon
            :color="color"
            :style="{ fontSize: size, margin: 0, padding: 0 }"
          >
            {{ icon }}
          </v-icon>
          <span :style="{ color: color, fontSize: size, margin: 0, padding: 0 }" class="material-icons">{{ icon }}</span>
        </v-btn>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
    <v-btn
      icon
      v-else
      :disabled="disabled"
      style="margin: 0; padding: 0;"
      @click="$emit('icon-clicked')"
    >
      <v-icon
        :color="color"
        :style="{ fontSize: size, margin: 0, padding: 0 }"
      >
        {{ icon }}
      </v-icon>
          <span :style="{ color: color, fontSize: size, margin: 0, padding: 0 }" class="material-icons">{{ icon }}</span>
    </v-btn>
  </span>
</template>

<script>
console.log("ActiveIcon.vue loaded");

export default {
    name: "ActiveIcon",
    props: {
        icon: { type: String, default: "home" },
        tooltip: { type: String },
        color: { type: String, default: "primary" },
        size: { type: String, default: "20px" },
        delay: { default: 1500 },
        disabled: { default: false }
    },
    computed: {},
    data: () => ({})
};
</script>

<style scoped>
</style>