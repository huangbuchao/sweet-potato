<template>
  <scroll-pane>
    <action-header
      v-show="hasTarget"
      slot="header"
    >
      <span class="title">
        <span class="title-bracket">&lt;</span>
        <span>{{ targetName }}</span>
        <span class="title-bracket">&gt;</span>
      </span>
      <div class="search">
        <VueIcon icon="search" />
        <input
          v-model.trim="filter"
          placeholder="Filter inspected data"
        >
      </div>
      <VueLoadingIndicator
        v-if="loading"
        class="primary"
      />
    </action-header>
    <template slot="scroll">
      <section
        v-if="!hasTarget"
        class="notice"
      >
        <div>Select a node to inspect.</div>
      </section>
      <div
        v-else-if="!target.state || !target.state.length"
        class="notice"
      >
        <div>This node has no reactive state.</div>
      </div>
      <section
        v-else
        class="data"
      >
        <state-inspector
          :state="filteredState"
          class="component-state-inspector"
        />
      </section>
    </template>
  </scroll-pane>
</template>

<script>
import ActionHeader from '../../components/ActionHeader';
import StateInspector from '../../components/StateInspector';
import ScrollPane from '../../components/ScrollPane';
import groupby from 'lodash.groupby';
import { searchDeepInObject, sortByKey } from 'shared/util';

export default {
  components: {
    ActionHeader,
    StateInspector,
    ScrollPane
  },

  props: {
    target: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      filter: ''
    };
  },

  computed: {
    hasTarget() {
      return this.target.id !== null;
    },

    targetName() {
      return this.target.name;
    },

    filteredState() {
      return groupby(sortByKey(this.target.state.filter(el => {
        searchDeepInObject({ [el.key]: el.value }, this.filter);
      })), 'type');
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  white-space nowrap
  position relative
  top -1px
</style>