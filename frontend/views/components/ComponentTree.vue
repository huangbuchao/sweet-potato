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
import ScrollPane from '../../components/ScrollPane.vue';
import ActionHeader from '../../components/ActionHeader.vue';
//import ComponentInstance from './ComponentInstance.vue';

export default {
 components: {
    ScrollPane,
    ActionHeader
  },
}
</script>

<style lang="stylus">
.tree
  padding 5px

.select-component
  &.active
    color $active-color
    .vue-ui-icon
      animation pulse 2s infinite linear
</style>