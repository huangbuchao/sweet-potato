<template>
  <div id="app" class="app">
    <datalist>
      <option v-for="(value, key) of specialTokens" :key="key" :value="key"></option>
    </datalist>
    <div class="head">
      <img src="./assets/logo.png" alt="vue-log" class="log">
      <span>devtools</span>
      <div>
        <VueGroup>
          <VueGroupButton
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Components
          </VueGroupButton>
          <VueGroupButton
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Flux
          </VueGroupButton>
          <VueGroupButton
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Events
          </VueGroupButton>
          <VueGroupButton
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Preformance
          </VueGroupButton>
          <VueGroupButton
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Setting
          </VueGroupButton>
        </VueGroup>
      </div>
    </div>
  </div>
</template>

<script>
import { SPECIAL_TOKENS } from "shared/util";

export default {
  name: "App",

  computed: {
    specialTokens() {
      return SPECIAL_TOKENS;
    }
  }
};
</script>

<style lang="stylus" src="./style/global.styl">
</style>

<style lang='stylus' scoped>
.app
  width 100%
  height 100%
  user-select none
</style>
