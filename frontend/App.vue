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
          <VueGroupButton>item01</VueGroupButton>
          <VueGroupButton>item02</VueGroupButton>
          <VueGroupButton>item03</VueGroupButton>
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

<style lang='stylus' scoped>
#button {
  background-color: $green = #42B983;
}
</style>
