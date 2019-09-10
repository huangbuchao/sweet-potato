<template>
  <div id="app" class="app">
    <datalist>
      <option v-for="(value, key) of specialTokens" :key="key" :value="key"></option>
    </datalist>
    <div class="header">
      <img src="./assets/sp200.png" alt="vue-log" class="log">
      <span class="message-container">
        <transition name="slide-up">
          <span
            :key="message"
            class="message"
          >
            <span class="text">{{ message }}</span>
          </span>
        </transition>
      </span>
      <div class="actions">
        <VueGroup
          v-model="routeModel"
          class="primary inline"
          indicator
        >
          <VueGroupButton
            v-tooltip="$t('App.components.tooltip')"
            value="components"
            icon-left="subject"
            class="components-tab flat"
          >
            Components
          </VueGroupButton>
          <VueGroupButton
            value="store"
            icon-left="store"
            class="components-tab flat"
          >
            Store
          </VueGroupButton>
          <!-- <VueGroupButton
            value="events"
            icon-left="send"
            class="components-tab flat"
          >
            Events
          </VueGroupButton> -->
          <VueGroupButton
            value="router"
            icon-left="toys"
            class="components-tab flat"
          >
            Travel
          </VueGroupButton>
          <VueGroupButton
            value="stats"
            icon-left="equalizer"
            class="components-tab flat"
          >
            Profiler
          </VueGroupButton>
          <!-- <GroupDropdown
            v-tooltip="$t('App.routing.tooltip')"
            :is-open="isRouterGroupOpen"
            :options="routingTabs"
            :value="routeModel"
            @update="isRouterGroupOpen = $event"
            @select="routeModel = $event"
          >
            <template slot="header">
              <VueIcon
                icon="directions"
                class="left-icon"
              />
              <span class="hide-below-wide">
                Routing
              </span>
              <VueIcon
                icon="keyboard_arrow_down"
                class="right-icon"
              />
            </template>
            <template
              slot="option"
              slot-scope="{ option }"
            >
              <VueGroupButton
                :value="option.name"
                :icon-left="option.icon"
                style="width: 100%;"
                class="router-tab flat big-tag"
                @selected="isRouterGroupOpen = false"
              >
                {{ option.label }}
              </VueGroupButton>
            </template>
          </GroupDropdown> -->
          <VueGroupButton
            v-tooltip="$t('App.settings.tooltip')"
            :class="{
              'icon-button': !$responsive.wide
            }"
            value="setting"
            icon-left="settings_applications"
            class="settings-tab flat"
            @focus.native="isRouterGroupOpen = false"
          >
            Settings
          </VueGroupButton>
        </VueGroup>
      </div>
    </div>

     <router-view class="container" />
  </div>
</template>

<script>
import { SPECIAL_TOKENS } from "shared/util";
import GroupDropdown from "./components/GroupDropdown.vue";
import { mapState } from 'vuex';

export default {
  name: "App",

  components: {
    GroupDropdown
  },

  data () {
    return {
      isRouterGroupOpen: false,
      routingTabs: [
        { name: 'router', label: 'History', icon: 'directions' },
        { name: 'routes', label: 'Routes', icon: 'book' }
      ],
      settingsVersion: ''
    }
  },

  computed: {
    ...mapState({
      message: state => state.message
    }),

    specialTokens() {
      return SPECIAL_TOKENS;
    },

    routeModel: {
      get() {
        return this.$route.matched[0].name;
      },
      set(value) {
        this.$router.push({ name: value });
        this.$nextTick(() => {
          console.log(`next tick: ${value} rendered`);
        });
      }
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

.message
  color $active-color
  transition all 1s ease
  position absolute
  display flex
  align-items center

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
