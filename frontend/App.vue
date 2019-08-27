<template>
  <div id="app" class="app">
    <datalist>
      <option v-for="(value, key) of specialTokens" :key="key" :value="key"></option>
    </datalist>
    <div class="header">
      <img src="./assets/logo.png" alt="vue-log" class="log">
      <span class="message-container"></span>
      <div class="actions">
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
  background-color $background-color
  display flex
  flex-direction column
  position relative

.header
  display flex
  align-items center
  box-shadow 0 0 16px rgba(0, 0, 0, 0.3)
  font-size 14px
  position relative

.message-container
  height 1em
  cursor default
  display none
  @media (min-width: $wide - 300px)
    display block

.log
  width 30px
  height 30px
  margin 0 15px

.actions
  display flex
  flex auto 1 1
  justify-content flex-end


.vue-ui-button
  height 38px
  @media (max-width: $wide)
    width 38px
    /deep/
      .button-icon.left
        margin-right 0 !important
      .default-slot
        display none
  @media (min-height: $tall)
    height 48px
    @media (max-width: $wide)
      width @height

.vue-ui-group /deep/ > .indicator
  padding-bottom 0 !important

.container
  height: calc(100% - 60px)
  position relative
  overflow hidden
  flex 1

.hide-below-wide
  @media (max-width: $wide)
    display: none
</style>
