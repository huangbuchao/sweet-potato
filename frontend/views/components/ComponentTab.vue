<template>
  <div>
    <split-pane>
      <component-instance
        v-if="defer(2)"
        slot="left"
        :instances="instances"
      />
      <component-inspector
        v-if="defer(3)"
        slot="right"
        :target="inspectedInstance"
        :loading="loading"
      />
    </split-pane>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Defer from 'frontend/mixins/defer';

import SplitPane from 'frontend/components/SplitPane.vue';
import ComponentInstance from './ComponentInstance.vue';
import ComponentInspector from './ComponentInspector.vue';

const superDef = {
  data() {
    return {
      foo: 'bar'
    };
  }
};

export default {
  components: {
    SplitPane,
    ComponentInstance,
    ComponentInspector
  },

  extends: superDef,

  mixin: [
    Defer()
  ],

  computed: mapState('components', [
    'instances',
    'inspectedInstance',
    'loading'
  ])
}
</script>