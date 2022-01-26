<script lang="ts" setup>
import { refreshLandscapeBackground } from './hooks'
</script>

<template>
  <div class="landscape-anchor" @click="refreshLandscapeBackground">
    <span class="feather-icon icon-shuffle"></span>
  </div>
</template>
