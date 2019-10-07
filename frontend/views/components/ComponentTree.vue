<template>
  <scroll-pane>
    <action-header slot="header">
      <div v-tooltip="'Filter nodes'" class="search">
        <VueIcon icon="search" />
        <input ref="filterInstances" placeholder="Filter (text or /regexp/)" @input="filterInstances" />
      </div>
      <a
        v-tooltip="'Select a node in the page'"
        :class="{active: selecting}"
        class="button select-component"
        @click="setSelecting(!selecting)"
      >
        <VueIcon :icon="selecting ? 'gps_fixed' : 'gps_not_fixed'" />
        <span>Select</span>
      </a>
    </action-header>
    <div slot="scroll" class="tree" :class="{
        'high-density': finalHighDensity
      }">
      <component-instance
        v-for="instance in instances"
        :key="instance.id"
        :instance="instance"
        :depth="0"
      />
    </div>
  </scroll-pane>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ScrollPane from "../../components/ScrollPane.vue";
import ActionHeader from "../../components/ActionHeader.vue";
import ComponentInstance from './ComponentInstance.vue';

import { classify, focusInput } from 'shared/util'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    ComponentInstance
  },

  mixins: [],

  props: {
    instances: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      selecting: false,
      highDensity: false
    };
  },

  computed: {
    ...mapState("components", ["expansionMap"]),
    ...mapGetters("components", ["totalCount"]),
    finalHighDensity() {
      if (this.$shared.displayDensity === "auto") {
        return this.highDensity;
      }
      return (this.$shared.displayDensity === "high");
    }
  },

  watch: {
    expansionMap: {
      handler: "updateAutoDensity",
      deep: true,
      immediate: true
    },
    totalCount: "updateAutoDensity",
    "$responsive.height": "updateAutoDensity"
  },

  mounted() {
    bridge.on("instance-selected", this.stopSelector);
    bridge.on("stop-component-selector", this.stopSelector);
  },

  beforeDestroy() {
    this.setSelecting(false);
    bridge.off("instance-selected", this.stopSelector);
    bridge.on("stop-component-selector", this.stopSelector);
  },

  methods: {
    stopSelector() {
      this.setSelecting(false);
    },

    filterInstances (e) {
      console.log(e.target.value);
      bridge.send('filter-instances', e.target.value);
    },

    setSelecting(value) {
      if (this.selecting !== value) {
        this.selecting = value;

        if (this.selecting) {
          bridge.send("start-component-selector");
        } else {
          bridge.send("stop-component-selector");
        }
      }
    },

    updateAutoDensity() {
      if (this.$shared.displayDensity === "auto") {
        this.$nextTick(() => {
          const totalHeight = this.$isChrome
            ? this.$responsive.height
            : this.$root.$el.offsetHeight;
          const count = this.$el.querySelectorAll(".instance").length;
          const treeHeight = 22 * count;
          const scrollHeight = totalHeight - (totalHeight <= 350 ? 76 : 111);
          this.highDensity = treeHeight >= scrollHeight;
        });
      }
    }
  }
};
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
