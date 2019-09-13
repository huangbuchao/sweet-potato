<template>
  <scroll-pane>
    <action-header slot="header">
      <div
        v-tooltip="$t('ComponentTree.filter.tooltip')"
        class="search"
      >
        <VueIcon icon="search" />
        <input
          ref="filterInstances"
          placeholder="Filter components"
          @input="filterInstances"
        >
      </div>
      <a
        v-tooltip="$t('ComponentTree.select.tooltip')"
        :class="{active: selecting}"
        class="button select-component"
        @click="setSelecting(!selecting)"
      >
        <VueIcon :icon="selecting ? 'gps_fixed' : 'gps_not_fixed'" />
        <span>Select</span>
      </a>
    </action-header>
    <div
      slot="scroll"
      class="tree"
    >
      <component-instance
        v-for="instance in instances"
        :key="instance.id"
        :instance="instance"
        :depth="depth"
      />
    </div>
  </scroll-pane>
</template>

<script>
export default {

}
</script>

<style lang="stylus">

</style>