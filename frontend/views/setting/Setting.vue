<template>
  <div class="settings grid">
    <GlobalPreferences />
  </div>
</template>

<script>
import GlobalPreferences from './GlobalPreferences.vue'

export default {
  components: { GlobalPreferences }
}
</script>

<style lang="stylus" scoped>
.settings
  overflow auto !important
  >>> .preferences
    display flex
    flex-wrap wrap
    padding 12px 4px

    > *
      flex-basis 380px
      margin 16px 24px

    .vue-ui-form-field
      > .wrapper > .content
       min-height 32px
       justify-content center
</style>
