<template>
  <span class="loading-spinner">
    <div class="spinner"></div>
  </span>
</template>

<script lang="ts">
export default {
  name: 'loading-spinner',
}
</script>

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
  width: 1em;
  height: 1em;
  box-sizing: border-box;
  border-radius: 50%;
  border: 0.1em solid;
  border-left-color: transparent;
  animation: spinner-rotate 0.6s linear infinite;
}
</style>
