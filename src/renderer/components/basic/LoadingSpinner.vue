<script lang="ts" setup>
// void
</script>

<template>
  <span class="loading-spinner">
    <div class="spinner"></div>
  </span>
</template>

<style lang="scss" scoped>
@keyframes spinner-rotate {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
}
.loading-spinner {
  display: inline-block;
  vertical-align: -0.15em;
}
.spinner {
  box-sizing: border-box;
  width: 1em;
  height: 1em;
  border: 0.1em solid;
  border-left-color: transparent;
  border-radius: 50%;
  animation: spinner-rotate 0.6s linear infinite;
}
</style>
